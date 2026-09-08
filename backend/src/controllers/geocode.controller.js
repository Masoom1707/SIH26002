/**
 * geocode.controller.js
 *
 * Proxies Nominatim geocoding requests through the Express backend so that
 * the required User-Agent header can be set — browsers cannot set this header
 * on fetch/XHR requests due to the Forbidden Headers restriction.
 */

/**
 * GET /api/geocode?q=<place name>
 * Returns { lat, lon, display_name } for the first Nominatim result.
 */
export const getGeocode = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
      const err = new Error("Query parameter 'q' is required");
      err.statusCode = 400;
      return next(err);
    }

    const nominatimUrl = [
      `https://nominatim.openstreetmap.org/search`,
      `?q=${encodeURIComponent(q.trim())}`,
      `&format=json`,
      `&limit=5`,                       // fetch 5 so we can pick best match within region
      `&countrycodes=in`,               // India only
      `&viewbox=89.5,29.5,97.5,20.5`,  // NE India bounding box (lon_min,lat_max,lon_max,lat_min)
      `&bounded=0`,                     // prefer but don't strictly limit to viewbox (0 = soft)
    ].join('');

    const response = await fetch(nominatimUrl, {
      headers: {
        // Nominatim usage policy requires a descriptive User-Agent
        "User-Agent": "SIH26002-landslide-app/1.0 (https://github.com/Masoom1707/SIH26002)",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      const err = new Error(`Nominatim returned ${response.status}`);
      err.statusCode = 502;
      return next(err);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      const err = new Error(`No results found for "${q}"`);
      err.statusCode = 404;
      return next(err);
    }

    const first = results[0];
    return res.status(200).json({
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      display_name: first.display_name,
    });

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 502;
      error.message = `Geocoding request failed: ${error.message}`;
    }
    return next(error);
  }
};
