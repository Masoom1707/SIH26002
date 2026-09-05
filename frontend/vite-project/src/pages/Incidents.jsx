import { incidents } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Mock chart data
const trendData = [
  { day: 'Mon', incidents: 2 },
  { day: 'Tue', incidents: 4 },
  { day: 'Wed', incidents: 1 },
  { day: 'Thu', incidents: 7 },
  { day: 'Fri', incidents: 3 },
  { day: 'Sat', incidents: 5 },
  { day: 'Sun', incidents: 2 },
];

export const Incidents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = () => {
    setIsModalOpen(false);
    // Step 4 integration: Toast Notification
    toast.success('Incident reported successfully. Awaiting verification.');
  };

  const modalFooter = (
    <>
      <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSubmit}>Submit Report</button>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Incident Management" 
        description="Monitor and report GIS anomalies and road blockages."
        actionButton={<button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Report Incident</button>}
      />
      
      {/* Chart Section */}
      <div className="card" style={{ marginBottom: '24px', height: '300px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Weekly Incident Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}
              itemStyle={{ color: 'var(--accent)' }}
            />
            <Bar dataKey="incidents" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table Section */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Time Reported</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td style={{ fontWeight: 600 }}>{inc.id}</td>
                  <td>{inc.type}</td>
                  <td>{inc.location}</td>
                  <td><Badge>{inc.severity}</Badge></td>
                  <td>{inc.time}</td>
                  <td><Badge>{inc.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report New Incident" footer={modalFooter}>
        <div className="form-group">
          <label className="form-label">Incident Type</label>
          <select className="form-control">
            <option>Landslide</option>
            <option>Flooding</option>
            <option>Road Blockage</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input type="text" className="form-control" placeholder="e.g., NH-10 Sector B" />
        </div>
      </Modal>
    </div>
  );
};