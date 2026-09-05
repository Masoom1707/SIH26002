import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Route, AlertTriangle, Package, Bell, Settings } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/vehicles', label: 'Vehicles', icon: Truck },
    { path: '/roads', label: 'Roads', icon: Route },
    { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/deliveries', label: 'Deliveries', icon: Package },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <div style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>SIH26002</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>LOGISTICS INTELLIGENCE</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({isActive}) => isActive ? "nav-item active" : "nav-item"}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};