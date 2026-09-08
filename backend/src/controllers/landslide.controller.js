/**
 * landslide.controller.js
 *
 * Proxies the GET /api/landslide route to the Python risk-engine service.
 * High/Very High risk results are also saved to MongoDB as Alert documents
 * (fire-and-forget — does not block the response to the frontend).
 */

import Alert from "../models/Alert.model.js";

/**
 * GET /api/landslide?lat=&lon=
 * Reads lat/lon from query params, forwards to the risk-engine, returns JSON.
 */
export const getRisk = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    // --- Validate query params ---
    if (lat === undefined || lon === undefined) {
      const err = new Error("lat and lon query parameters are required");
      err.statusCode = 400;
      return next(err);
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (!isFinite(parsedLat) || !isFinite(parsedLon)) {
      const err = new Error("lat and lon must be valid finite numbers");
      err.statusCode = 400;
      return next(err);
    }

    // --- Forward to risk-engine ---
    const riskEngineUrl = process.env.RISK_ENGINE_URL || "http://localhost:8000";
    const targetUrl = `${riskEngineUrl}/predict?lat=${parsedLat}&lon=${parsedLon}`;

    const response = await fetch(targetUrl);

    if (!response.ok) {
      const body = await response.text().catch(() => "Unknown error");
      const err = new Error(`Risk engine returned ${response.status}: ${body}`);
      err.statusCode = response.status;
      return next(err);
    }

    const data = await response.json();

    // --- Fire-and-forget alert save for high-risk predictions ---
    // Skip outside_coverage responses — they are not real risk events
    if (!data.error && (data.risk_category === "High" || data.risk_category === "Very High")) {
      Alert.create({
        latitude: data.latitude,
        longitude: data.longitude,
        riskCategory: data.risk_category,
        riskPercentage: data.risk_percentage,
        message: `${data.risk_category} landslide risk (${data.risk_percentage.toFixed(1)}%) detected at (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`,
        source: "map-click",
      }).catch((err) => console.error("alert save failed:", err));
    }

    return res.status(200).json(data);

  } catch (error) {
    // Network errors (risk-engine not running, etc.) go through errorMiddleware
    if (!error.statusCode) {
      error.statusCode = 503;
      error.message = `Could not reach risk-engine at ${process.env.RISK_ENGINE_URL || "http://localhost:8000"}: ${error.message}`;
    }
    return next(error);
  }
};

