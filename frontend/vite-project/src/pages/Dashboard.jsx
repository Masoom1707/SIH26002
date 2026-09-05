import React from 'react';
import { dashboardKPIs, vehicles, alerts } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { MapPanel } from '../components/map/MapPanel'; // <--- NEW IMPORT
import { Truck, Clock, AlertTriangle, Activity, Bell } from 'lucide-react';

const iconMap = {
  truck: Truck, clock: Clock, 'alert-triangle': AlertTriangle, activity: Activity, bell: Bell
};

export const Dashboard = () => {
  return (
    <div className="dashboard-grid">
      {/* KPIs */}
      <div className="kpi-row">
        {dashboardKPIs.map((kpi, idx) => {
          const Icon = iconMap[kpi.icon];
          return (
            <div key={idx} className="card kpi-card">
              <div className={`kpi-icon ${kpi.status}`}>
                <Icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpi.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Map Area - UPDATED */}
      <div className="card map-section" style={{ position: 'relative', padding: 0, overflow: 'hidden' }}>
        <MapPanel />
        
        {/* Map UI Overlay */}
        <div className="map-legend" style={{ zIndex: 1000, position: 'absolute', bottom: '16px', left: '16px', background: 'var(--surface-elevated)', border: 'none' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Live Trackers</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent)', border: '2px solid #fff' }}></span> Active Vehicle
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)', border: '2px solid #fff' }}></span> Critical Incident
          </div>
        </div>
      </div>

      {/* Side Panels */}
      <div className="side-panel">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Critical Operational Alerts</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ padding: '12px', borderLeft: `3px solid var(--${alert.level === 'CRITICAL' ? 'danger' : alert.level === 'WARNING' ? 'warning' : 'info'})`, backgroundColor: 'var(--surface-elevated)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: `var(--${alert.level === 'CRITICAL' ? 'danger' : alert.level === 'WARNING' ? 'warning' : 'info'})` }}>{alert.level}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{alert.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="card-header">
            <div className="card-title">Active Vehicles Summary</div>
          </div>
          <div className="table-container">
            <table>
              <tbody>
                {vehicles.slice(0, 3).map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.cargo}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Badge>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};