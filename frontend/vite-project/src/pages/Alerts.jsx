import React from 'react';
import { alerts } from '../data/mockData';
import { PageHeader } from '../components/common/PageHeader';
import { AlertTriangle, Info, BellRing } from 'lucide-react';

const alertConfig = {
  CRITICAL: { icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--danger-bg)' },
  WARNING: { icon: BellRing, color: 'var(--warning)', bg: 'var(--warning-bg)' },
  INFO: { icon: Info, color: 'var(--info)', bg: 'var(--info-bg)' }
};

export const Alerts = () => {
  return (
    <div>
      <PageHeader 
        title="Operational Alerts Center" 
        description="System-generated notifications for logistics anomalies." 
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {alerts.map(alert => {
          const Config = alertConfig[alert.level];
          const Icon = Config.icon;
          return (
            <div key={alert.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderLeft: `4px solid ${Config.color}` }}>
              <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: Config.bg, color: Config.color }}>
                <Icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: Config.color }}>{alert.level} ALERT</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '12px' }}>{alert.message}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View on Map</button>
                  {alert.level === 'CRITICAL' && <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Acknowledge</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};