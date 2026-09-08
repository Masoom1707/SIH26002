/**
 * alert.controller.js
 *
 * Returns the 50 most recent Alert documents, newest first.
 */

import Alert from "../models/Alert.model.js";

/**
 * GET /api/alerts
 */
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50).lean();
    return res.status(200).json(alerts);
  } catch (error) {
    return next(error);
  }
};
