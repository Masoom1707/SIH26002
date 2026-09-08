"""
main.py — Landslide Risk Engine

FastAPI service that loads all geospatial rasters + ML model ONCE at startup
and exposes GET /predict?lat=&lon= for instant risk inference.

Start with:
    uvicorn main:app --reload --port 8000
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import rasterio
import xarray as xr
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).parent / "data"

_REQUIRED_FILES = [
    "DEM.tif",
    "slope.tif",
    "aspect.tif",
    "dist_to_road.tif",
    "landslide_model.pkl",
]

_RAINFALL_FILES = [
    "RF25_indselect_rfp25.nc",
    "RF25_ind2024_rfp25.nc",   # fallback name variant
]

# ---------------------------------------------------------------------------
# Module-level resources — loaded once when the process starts
# ---------------------------------------------------------------------------

for _f in _REQUIRED_FILES:
    _path = DATA_DIR / _f
    if not _path.exists():
        _derived = {"slope.tif", "aspect.tif", "dist_to_road.tif"}
        if _f in _derived:
            raise RuntimeError(
                f"Derived raster not found: {_path}\n"
                "Run the precompute script first:\n"
                "  pip install -r requirements-dev.txt\n"
                "  python scripts/precompute_layers.py"
            )
        raise RuntimeError(
            f"Required file not found: {_path}\n"
            "Ensure data/ contains DEM.tif and landslide_model.pkl."
        )

# Rasterio file handles — kept open for fast .sample() calls
_dem_src   = rasterio.open(DATA_DIR / "DEM.tif")
_slope_src = rasterio.open(DATA_DIR / "slope.tif")
_aspect_src = rasterio.open(DATA_DIR / "aspect.tif")
_dist_src  = rasterio.open(DATA_DIR / "dist_to_road.tif")


# Rainfall — mean over time dimension computed once, stored as DataArray
# The .nc file may be a placeholder (0 bytes) until the user places the real file.
_rain_da = None
_nc_path = next(
    (DATA_DIR / f for f in _RAINFALL_FILES if (DATA_DIR / f).exists() and (DATA_DIR / f).stat().st_size > 0),
    None,
)
if _nc_path is not None:
    try:
        _rain_ds = xr.open_dataset(_nc_path)
        # Average across the time dimension once — makes per-request lookup O(1)
        _rain_da = _rain_ds["RAINFALL"].mean("time")
        print(f"✓ Rainfall dataset loaded and time-averaged ({_nc_path.name})")
    except Exception as _nc_err:
        print(f"⚠ WARNING: Could not load rainfall dataset: {_nc_err}")
        print("  Rainfall values will be reported as 0.0 until a valid .nc file is placed in data/")
else:
    print("⚠ WARNING: No valid rainfall NetCDF found in data/.")
    print("  Expected one of:", _RAINFALL_FILES)
    print("  Rainfall values will default to 0.0. Place the real file in data/ and restart.")

# ML model
_model = joblib.load(DATA_DIR / "landslide_model.pkl")

print("✓ DEM, slope, aspect, dist_to_road rasters loaded")
print("✓ ML model loaded")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Landslide Risk Engine",
    description="Predict landslide risk probability at any lat/lon within the DEM coverage area.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1707",   # Express backend (original port reference)
        "http://localhost:1710",   # Express backend (actual port from .env)
        "http://localhost:5173",   # Vite dev server
        "http://localhost:5174",   # Vite dev server (alt port)
        "http://127.0.0.1:5173",
        "http://127.0.0.1:1710",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _sample(src: rasterio.DatasetReader, lat: float, lon: float) -> float:
    """Sample a single float value from a rasterio dataset at (lat, lon)."""
    val = list(src.sample([(lon, lat)]))[0][0]
    return float(val)


def _sample_rainfall(lat: float, lon: float) -> float:
    """Nearest-neighbour lookup from the pre-averaged rainfall DataArray.
    Returns 0.0 if no rainfall dataset is loaded (placeholder .nc file)."""
    if _rain_da is None:
        return 0.0
    # Coordinate names match the IMD NetCDF format (LATITUDE / LONGITUDE)
    val = _rain_da.sel(LATITUDE=lat, LONGITUDE=lon, method="nearest")
    return float(val.values)


def _get_risk_category(probability: float) -> str:
    """Return a human-readable risk category from a [0,1] probability score."""
    if probability < 0.20:
        return "Very Low"
    elif probability < 0.40:
        return "Low"
    elif probability < 0.60:
        return "Moderate"
    elif probability < 0.80:
        return "High"
    else:
        return "Very High"


def _extract_all_features(lat: float, lon: float) -> dict:
    """
    Replicate extract_all_features() from the notebook using in-memory rasters.
    Returns a dict with: elevation, slope, aspect, dist_to_road, rainfall.
    """
    elevation   = _sample(_dem_src,    lat, lon)
    slope       = _sample(_slope_src,  lat, lon)
    aspect      = _sample(_aspect_src, lat, lon)
    dist_to_road = _sample(_dist_src,  lat, lon)
    rainfall    = _sample_rainfall(lat, lon)

    return {
        "elevation":    elevation,
        "slope":        slope,
        "aspect":       aspect,
        "dist_to_road": dist_to_road,
        "rainfall":     rainfall,
    }


def _predict_landslide_risk(lat: float, lon: float) -> dict:
    """
    Full pipeline: extract features → model inference → risk category.
    Mirrors predict_landslide_risk() from the notebook.
    """
    features = _extract_all_features(lat, lon)

    # Build DataFrame with exact column order expected by the model
    X = pd.DataFrame(
        [[
            features["elevation"],
            features["slope"],
            features["aspect"],
            features["dist_to_road"],
            features["rainfall"],
        ]],
        columns=["elevation", "slope", "aspect", "dist_to_road", "rainfall"],
    )

    prediction  = int(_model.predict(X)[0])
    probability = float(_model.predict_proba(X)[0, 1])

    return {
        "latitude":       lat,
        "longitude":      lon,
        "elevation":      round(features["elevation"], 2),
        "slope":          round(features["slope"], 4),
        "aspect":         round(features["aspect"], 4),
        "dist_to_road":   round(features["dist_to_road"], 2),
        "rainfall":       round(features["rainfall"], 4),
        "prediction":     prediction,
        "risk_percentage": round(probability * 100, 2),
        "risk_category":  _get_risk_category(probability),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    """Liveness check — returns 200 if the service is up and models are loaded."""
    return {"status": "ok"}


@app.get("/predict")
def predict(
    lat: float = Query(..., description="Latitude in decimal degrees (WGS-84)"),
    lon: float = Query(..., description="Longitude in decimal degrees (WGS-84)"),
):
    """
    Predict landslide risk probability at the given coordinates.

    Returns elevation, slope, aspect, distance-to-road, and mean daily rainfall
    alongside the model's binary prediction (0/1), risk percentage, and category.
    """
    # Validate coordinates are within DEM bounds
    dem_bounds = _dem_src.bounds
    if not (dem_bounds.left <= lon <= dem_bounds.right and
            dem_bounds.bottom <= lat <= dem_bounds.top):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Coordinates ({lat}, {lon}) are outside the DEM coverage area. "
                f"Valid range: lat [{dem_bounds.bottom:.4f}, {dem_bounds.top:.4f}], "
                f"lon [{dem_bounds.left:.4f}, {dem_bounds.right:.4f}]."
            ),
        )

    try:
        result = _predict_landslide_risk(lat, lon)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return result
