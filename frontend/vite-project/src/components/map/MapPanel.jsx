import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { vehicles as initialVehicles, incidents } from '../../data/mockData';
import { Badge } from '../common/Badge';
import { getLandslideRisk } from '../../services/api';

// ---------------------------------------------------------------------------
// Existing marker icons (unchanged)
// ---------------------------------------------------------------------------
const vehicleIcon  = L.divIcon({ className: 'vehicle-marker',  iconSize: [14, 14], iconAnchor: [7, 7] });
const incidentIcon = L.divIcon({ className: 'incident-marker', iconSize: [16, 16], iconAnchor: [8, 8] });

// ---------------------------------------------------------------------------
// Risk marker icons — colour reflects risk category
// ---------------------------------------------------------------------------
const getRiskIcon = (category, isLoading = false) => {
  if (isLoading) {
    return L.divIcon({ className: 'risk-marker risk-marker-loading', iconSize: [18, 18], iconAnchor: [9, 9] });
  }
  const cls =
    category === 'Very Low' || category === 'Low'
      ? 'risk-marker-low'
      : category === 'Moderate'
      ? 'risk-marker-moderate'
      : 'risk-marker-high';
  return L.divIcon({ className: `risk-marker ${cls}`, iconSize: [18, 18], iconAnchor: [9, 9] });
};

// Map risk category to the app's CSS colour tokens
const CATEGORY_COLOUR = {
  'Very Low': 'var(--success)',
  'Low':      'var(--success)',
  'Moderate': 'var(--warning)',
  'High':     'var(--danger)',
  'Very High':'var(--danger)',
};

// ---------------------------------------------------------------------------
// Inner component — must live inside <MapContainer>
// ---------------------------------------------------------------------------
const ClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const MapPanel = () => {
  const [liveVehicles, setLiveVehicles] = useState(initialVehicles);

  // Risk prediction state
  const [riskMarkers, setRiskMarkers]   = useState([]);   // resolved predictions
  const [pendingMarker, setPendingMarker] = useState(null); // loading spinner position

  // Simulate live vehicle movement (unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVehicles(prev => prev.map(v => {
        if (v.id === "TRUCK-001") {
          return { ...v, position: [v.position[0] + 0.005, v.position[1] - 0.001] };
        }
        return v;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle a map click — fetch landslide risk at that point
  const handleMapClick = async ({ lat, lng }) => {
    const id = Date.now();
    setPendingMarker({ id, lat, lon: lng });

    try {
      const result = await getLandslideRisk(lat, lng);
      setPendingMarker(null);
      setRiskMarkers(prev => [...prev, { id, ...result }]);
    } catch (err) {
      setPendingMarker(null);
      toast.error(`Risk lookup failed: ${err.message}`);
    }
  };

  return (
    <MapContainer
      center={[25.3, 93.0]}
      zoom={9}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        attribution='&copy; Stadia Maps'
      />

      {/* Click-to-predict handler */}
      <ClickHandler onMapClick={handleMapClick} />

      {/* Vehicle routes */}
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

      {/* Pending (loading) risk marker */}
      {pendingMarker && (
        <Marker
          key={`pending-${pendingMarker.id}`}
          position={[pendingMarker.lat, pendingMarker.lon]}
          icon={getRiskIcon(null, true)}
        >
          <Popup>
            <div style={{ padding: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Analysing risk…
            </div>
          </Popup>
        </Marker>
      )}

      {/* Resolved risk prediction markers */}
      {riskMarkers.map((marker) => {
        const colour = CATEGORY_COLOUR[marker.risk_category] ?? 'var(--accent)';
        return (
          <Marker
            key={`risk-${marker.id}`}
            position={[marker.latitude, marker.longitude]}
            icon={getRiskIcon(marker.risk_category)}
          >
            <Popup minWidth={210}>
              <div style={{ padding: '8px' }}>

                {/* Risk category header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: colour }}>
                    {marker.risk_category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {marker.prediction === 1 ? '⚠ High risk' : '✓ Low risk'}
                  </span>
                </div>

                {/* Risk percentage bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Risk Score
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${marker.risk_percentage}%`,
                      background: colour,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '4px', color: colour }}>
                    {marker.risk_percentage.toFixed(1)}%
                  </div>
                </div>

                {/* Feature grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Elevation</div>
                    <div style={{ fontWeight: 600 }}>{marker.elevation.toFixed(0)} m</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Slope</div>
                    <div style={{ fontWeight: 600 }}>{marker.slope.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Rainfall</div>
                    <div style={{ fontWeight: 600 }}>
                      {marker.rainfall > 0 ? `${marker.rainfall.toFixed(1)} mm` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Road Dist.</div>
                    <div style={{ fontWeight: 600 }}>
                      {marker.dist_to_road >= 1000
                        ? `${(marker.dist_to_road / 1000).toFixed(1)} km`
                        : `${marker.dist_to_road.toFixed(0)} m`}
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRiskMarkers(prev => prev.filter(m => m.id !== marker.id));
                  }}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '5px',
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Remove marker
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};