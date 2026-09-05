import React from 'react';
import { PageHeader } from '../components/common/PageHeader';

export const Settings = () => {
  return (
    <div>
      <PageHeader title="System Settings" description="Configure SIH26002 platform preferences." />
      
      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>System Preferences</h3>
          <div className="form-group">
            <label className="form-label">Default Region</label>
            <select className="form-control">
              <option>North Eastern Region (All)</option>
              <option>Assam</option>
              <option>Meghalaya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Refresh Interval (Data Pull)</label>
            <select className="form-control">
              <option>Real-time (WebSocket)</option>
              <option>Every 30 seconds</option>
              <option>Every 1 minute</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '10px' }}>Save System Preferences</button>
        </div>

        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Notification Routing</h3>
          <div className="form-group">
            <label className="form-label">Critical Alert Forwarding</label>
            <input type="email" className="form-control" defaultValue="admin-ops@sih26002.gov.in" />
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
            <input type="checkbox" id="sms" defaultChecked style={{ width: '18px', height: '18px' }} />
            <label htmlFor="sms">Enable SMS alerts for field officers</label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '20px' }}>Update Notifications</button>
        </div>
      </div>
    </div>
  );
};