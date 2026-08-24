import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import Glyph from '../components/Glyph';

function TeacherDashboard() {
  const { user } = useAuth();
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
          <h1>Teacher Dashboard</h1>
          <p className="muted">Welcome, {user.name} · {user.department || 'Faculty'}</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Assigned courses" value={data.stats.courses} />
        <StatCard label="Total students" value={data.stats.students} />
        <StatCard label="Pending submissions" value={data.stats.pendingSubmissions} />
        <StatCard label="Avg attendance" value={`${data.stats.attendancePercentage}%`} />
      </div>

      <div className="quick-links-grid teacher-quick">
        <Link to="/assignments" className="quick-link-card accent">
          <Glyph name="assignments" />
          <span>Create Assignment</span>
        </Link>
        <Link to="/attendance" className="quick-link-card">
          <Glyph name="attendance" />
          <span>Mark Attendance</span>
        </Link>
        <Link to="/resources" className="quick-link-card">
          <Glyph name="courses" />
          <span>Upload Resource</span>
        </Link>
        <Link to="/results" className="quick-link-card">
          <Glyph name="results" />
          <span>Add Results</span>
        </Link>
        <Link to="/exams" className="quick-link-card">
          <Glyph name="exams" />
          <span>Schedule Exam</span>
        </Link>
        <Link to="/notifications" className="quick-link-card">
          <Glyph name="bell" />
          <span>Send Notification</span>
        </Link>
      </div>

      <div className="split">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent assignments</h2>
            <Link to="/assignments" className="text-link">View all</Link>
          </div>
          {data.recentAssignments.length === 0 ? (
            <p className="empty">No assignments yet.</p>
          ) : (
            <ul className="notice-list">
              {data.recentAssignments.map((item) => (
                <li key={item._id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="muted">{item.course?.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Upcoming exams</h2>
            <Link to="/exams" className="text-link">View all</Link>
          </div>
          {data.upcomingExams.length === 0 ? (
            <p className="empty">No upcoming exams.</p>
          ) : (
            <ul className="notice-list">
              {data.upcomingExams.map((exam) => (
                <li key={exam._id}>
                  <div>
                    <strong>{exam.title}</strong>
                    <p className="muted">{exam.course?.name} · {new Date(exam.examDate).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default TeacherDashboard;
