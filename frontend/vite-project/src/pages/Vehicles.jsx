import { vehicles } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { Drawer } from '../components/common/Drawer';
import { Map, Thermometer, Navigation, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export const Vehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <div>
      <PageHeader title="Vehicle Fleet Monitoring" description="Real-time tracking of logistics assets." />
      
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Cargo</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Destination</th>
                <th>ETA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                // Add the premium pulsing red border if priority is CRITICAL
                <tr key={v.id} className={v.priority === 'CRITICAL' ? 'row-critical' : ''}>
                  <td style={{ fontWeight: 600 }}>
                    {v.id}
                    {v.priority === 'CRITICAL' && <ShieldAlert size={14} color="var(--danger)" style={{ marginLeft: '8px', verticalAlign: 'middle' }}/>}
                  </td>
                  <td>{v.cargo}</td>
                  <td><Badge>{v.priority}</Badge></td>
                  <td><Badge>{v.status}</Badge></td>
                  <td>{v.destination}</td>
                  <td style={{ color: v.priority === 'CRITICAL' ? 'var(--danger)' : 'inherit', fontWeight: v.priority === 'CRITICAL' ? 600 : 400 }}>
                    {v.eta}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => setSelectedVehicle(v)}
                    >
                      View Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Premium Slide-out Drawer */}
      <Drawer 
        isOpen={!!selectedVehicle} 
        onClose={() => setSelectedVehicle(null)} 
        title={selectedVehicle ? `Telemetry: ${selectedVehicle.id}` : ''}
      >
        {selectedVehicle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: selectedVehicle.status === 'IN TRANSIT' ? 'var(--success)' : 'var(--warning)' }}>
                  {selectedVehicle.status}
                </div>
              </div>
              <Badge>{selectedVehicle.priority}</Badge>
            </div>

            {/* Live Sensor Data Simulation */}
            <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Live Sensors</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Thermometer color="var(--info)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cargo Temp</div>
                  <div style={{ fontWeight: 600 }}>-4.2°C</div>
                </div>
              </div>
              <div className="card" style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Navigation color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Speed</div>
                  <div style={{ fontWeight: 600 }}>42 km/h</div>
                </div>
              </div>
            </div>

            {/* Logistics Details */}
            <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Manifest Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cargo Type:</span>
                <span style={{ fontWeight: 500 }}>{selectedVehicle.cargo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vehicle Class:</span>
                <span style={{ fontWeight: 500 }}>{selectedVehicle.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                <span style={{ fontWeight: 500 }}>{selectedVehicle.destination}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Updated ETA:</span>
                <span style={{ fontWeight: 500 }}>{selectedVehicle.eta}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Map size={18} /> Ping Location via Satellite
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
};