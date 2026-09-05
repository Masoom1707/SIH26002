import { vehicles, incidents, roads, deliveries, alerts, dashboardKPIs } from '../data/mockData';

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

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