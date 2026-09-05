import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- Import Toaster
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Roads } from './pages/Roads';
import { Incidents } from './pages/Incidents';
import { Deliveries } from './pages/Deliveries';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

function App() {
  return (
    <>
      {/* Configure Toaster for the Dark Theme */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } },
        }}
      />
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="roads" element={<Roads />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;