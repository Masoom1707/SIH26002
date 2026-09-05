import  { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vehicles as initialVehicles, incidents } from '../../data/mockData';
import { Badge } from '../common/Badge';

const vehicleIcon = L.divIcon({ className: 'vehicle-marker', iconSize: [14, 14], iconAnchor: [7, 7] });
const incidentIcon = L.divIcon({ className: 'incident-marker', iconSize: [16, 16], iconAnchor: [8, 8] });

export const MapPanel = () => {
  const [liveVehicles, setLiveVehicles] = useState(initialVehicles);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVehicles(prev => prev.map(v => {
        if (v.id === "TRUCK-001") {
          return { ...v, position: [v.position[0] + 0.005, v.position[1] - 0.001] };
        }
        return v;
      }));
    }, 2000); // Updates every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[25.8, 91.8]} zoom={8} zoomControl={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        attribution='&copy; Stadia Maps'
      />

      {liveVehicles.filter(v => v.route).map(v => (
        <Polyline 
          key={`route-${v.id}`} 
          positions={v.route} 
          color="var(--accent)" 
          weight={3} 
          opacity={0.6} 
          dashArray="5, 10" 
        />
      ))}

      {/* Live Vehicles */}
      {liveVehicles.map((v) => (
        <Marker key={v.id} position={v.position} icon={vehicleIcon}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{v.id}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{v.cargo}</div>
              <Badge type={v.status === 'IN TRANSIT' ? 'success' : 'warning'}>{v.status}</Badge>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Incidents */}
      {incidents.map((inc) => (
        <Marker key={inc.id} position={inc.position} icon={incidentIcon}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '1rem' }}>{inc.type}</div>
              <Badge type="danger">{inc.severity}</Badge>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};