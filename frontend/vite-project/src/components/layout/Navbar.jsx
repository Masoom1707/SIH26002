import { Bell, User, Activity } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Command Center</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Activity size={16} />
          SYSTEM OPERATIONAL
        </div>
        <div style={{ cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin</span>
        </div>
      </div>
    </header>
  );
};