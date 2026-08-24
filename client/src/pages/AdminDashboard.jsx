import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import Glyph from '../components/Glyph';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch((err) => setError(err.message));
  }, []);

  if (!data && !error) return <Loading label="Loading dashboard..." />;
  if (error) return <p className="alert error">{error}</p>;

  return (
    <div>
      <div className="dash-welcome">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">Institution overview and management shortcuts</p>
        </div>
        <Link to="/users" className="primary-btn">Manage Users</Link>
      </div>

      <div className="stat-grid admin-stats">
        <StatCard label="Students" value={data.stats.students} />
        <StatCard label="Teachers" value={data.stats.teachers} />
        <StatCard label="Courses" value={data.stats.courses} />
        <StatCard label="Assignments" value={data.stats.assignments} />
        <StatCard label="Active users" value={data.stats.activeUsers} />
        <StatCard label="Pending approvals" value={data.stats.pendingApprovals || 0} />
        <StatCard label="Avg attendance" value={`${data.stats.attendancePercentage}%`} />
        <StatCard label="Submissions" value={data.stats.submissions} />
        <StatCard label="Graded" value={data.stats.gradedSubmissions} />
      </div>

      <div className="quick-links-grid admin-quick">
        <Link to="/users" className="quick-link-card accent">
          <Glyph name="users" />
          <span>All Users</span>
        </Link>
        <Link to="/courses" className="quick-link-card">
          <Glyph name="courses" />
          <span>Courses</span>
        </Link>
        <Link to="/assignments" className="quick-link-card">
          <Glyph name="assignments" />
          <span>Assignments</span>
        </Link>
        <Link to="/notifications" className="quick-link-card">
          <Glyph name="bell" />
          <span>Notifications</span>
        </Link>
        <Link to="/messages" className="quick-link-card">
          <Glyph name="mail" />
          <span>Messages</span>
        </Link>
        <Link to="/settings" className="quick-link-card">
          <Glyph name="lock" />
          <span>Settings</span>
        </Link>
      </div>

      {(data.pendingUsers || []).length > 0 && (
        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head">
            <h2>Pending approvals</h2>
            <Link to="/users" className="text-link">Review all</Link>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Requested</th></tr>
            </thead>
            <tbody>
              {data.pendingUsers.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.email}</td>
                  <td><span className={`badge ${item.role}`}>{item.role}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>Recent registrations</h2>
          <Link to="/users" className="text-link">View all users</Link>
        </div>
        {data.recentUsers.length === 0 ? (
          <p className="empty">No recent users.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {data.recentUsers.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.email}</td>
                  <td><span className={`badge ${item.role}`}>{item.role}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
