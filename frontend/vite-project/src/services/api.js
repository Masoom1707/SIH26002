import { vehicles, incidents, roads, deliveries, alerts, dashboardKPIs } from '../data/mockData';

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Backend base URL — the Express server acts as an intermediary
// ---------------------------------------------------------------------------
const BACKEND_URL = 'http://localhost:1710';

// ---------------------------------------------------------------------------
// Mock API functions (unchanged — all data still comes from mockData.js)
// ---------------------------------------------------------------------------
export const api = {
  getDashboardData: async () => {
    await delay();
    return dashboardKPIs;
  },

  getVehicles: async () => {
    await delay();
    return vehicles;
  },

  getIncidents: async () => {
    await delay();
    return incidents;
  },
  
  createIncident: async (incidentData) => {
    await delay(1200); 
    return { success: true, message: "Incident logged successfully." };
  },

  getRoads: async () => {
    await delay();
    return roads;
  },

  getDeliveries: async () => {
    await delay();
    return deliveries;
  },

  getAlerts: async () => {
    await delay();
    return alerts;
  }
};

// ---------------------------------------------------------------------------
// Real landslide risk API — hits the Express backend → Python risk-engine
// ---------------------------------------------------------------------------

/**
 * getLandslideRisk(lat, lon)
 *
 * Calls GET /api/landslide?lat=..&lon=.. on the Express backend, which proxies
 * to the Python risk-engine service.
 *
 * Returns the full prediction JSON:
 * { latitude, longitude, elevation, slope, aspect, dist_to_road, rainfall,
 *   prediction, risk_percentage, risk_category }
 *
 * @throws {Error} with a human-readable message on network or API errors.
 */
export const getLandslideRisk = async (lat, lon) => {
  const url = `${BACKEND_URL}/api/landslide?lat=${lat}&lon=${lon}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Attempt to extract message from JSON error body (errorMiddleware format)
    const err = await response.json().catch(() => null);
    const message = err?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
};