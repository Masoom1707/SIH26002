/**
 * route-risk.controller.js
 *
 * Accepts a batch of lat/lon points, forwards to the Python risk-engine's
 * POST /predict-batch endpoint, and returns the results to the caller.
 *
 * High/Very High results are also saved to MongoDB as Alert documents
 * (fire-and-forget — does not block the response).
 */

import Alert from "../models/Alert.model.js";

/**
 * POST /api/route-risk
 * Body: { points: [{ lat, lon }, ...] }
 */
export const getRouteRisk = async (req, res, next) => {
  try {
    const { points } = req.body;

    if (!Array.isArray(points) || points.length === 0) {
      const err = new Error("Request body must include a non-empty 'points' array");
      err.statusCode = 400;
      return next(err);
    }

    const riskEngineUrl = process.env.RISK_ENGINE_URL || "http://localhost:8000";
    const targetUrl = `${riskEngineUrl}/predict-batch`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "Unknown error");
      const err = new Error(`Risk engine returned ${response.status}: ${body}`);
      err.statusCode = response.status;
      return next(err);
    }

    const data = await response.json();

    // --- Fire-and-forget alert saves for high-risk points along the route ---
    const highRiskPoints = (data.results ?? []).filter(
      (r) => r && (r.risk_category === "High" || r.risk_category === "Very High")
    );

    if (highRiskPoints.length > 0) {
      const alertDocs = highRiskPoints.map((r) => ({
        latitude: r.latitude,
        longitude: r.longitude,
        riskCategory: r.risk_category,
        riskPercentage: r.risk_percentage,
        message: `${r.risk_category} risk (${r.risk_percentage.toFixed(1)}%) on route at (${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)})`,
        source: "route-check",
      }));

      Alert.insertMany(alertDocs).catch((err) =>
        console.error("alert save failed:", err)
      );
    }

    return res.status(200).json(data);

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 503;
      error.message = `Could not reach risk-engine at ${process.env.RISK_ENGINE_URL || "http://localhost:8000"}: ${error.message}`;
    }
    return next(error);
  }
};
