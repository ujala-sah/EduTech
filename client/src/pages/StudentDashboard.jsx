import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import Glyph from '../components/Glyph';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch((err) => setError(err.message));
  }, []);

  if (!data && !error) return <Loading label="Loading dashboard..." />;
  if (error) return <p className="alert error">{error}</p>;

  const attendPct = data.stats.attendancePercentage;

  return (
    <div>
      <div className="dash-welcome">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="muted">Student ID: {user.studentId || 'Not assigned'} · {user.department || 'No department'}</p>
        </div>
        <Link to="/assignments" className="accent-btn">View assignments</Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Enrolled courses" value={data.stats.courses} />
        <StatCard label="Pending assignments" value={data.stats.pendingAssignments} />
        <StatCard label="Completed" value={data.stats.completedAssignments} />
        <StatCard
          label="Attendance"
          value={`${attendPct}%`}
          hint={attendPct < 75 ? 'Below required' : 'On track'}
        />
      </div>

      {attendPct < 75 && (
        <div className="alert-banner warn">
          Your attendance is below 75%. Attend more classes to avoid academic penalties.
        </div>
      )}

      <div className="split">
        <section className="panel">
          <div className="panel-head">
            <h2>Upcoming assignments</h2>
            <Link to="/assignments" className="text-link">View all</Link>
          </div>
          {data.upcomingAssignments.length === 0 ? (
            <p className="empty">No pending assignments. You're all caught up!</p>
          ) : (
            <table>
              <thead>
                <tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.upcomingAssignments.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.course?.name}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td><span className={`badge ${(item.status || 'Pending').toLowerCase()}`}>{item.status || 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Upcoming exams</h2>
            <Link to="/exams" className="text-link">Full schedule</Link>
          </div>
          {data.upcomingExams.length === 0 ? (
            <p className="empty">No upcoming exams scheduled.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Subject</th><th>Date</th><th>Time</th><th>Room</th></tr>
              </thead>
              <tbody>
                {data.upcomingExams.map((exam) => (
                  <tr key={exam._id}>
                    <td><strong>{exam.course?.name}</strong></td>
                    <td>{formatDate(exam.examDate)}</td>
                    <td>{exam.startTime} - {exam.endTime}</td>
                    <td>{exam.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <div className="quick-links-grid">
        <Link to="/courses" className="quick-link-card">
          <Glyph name="courses" />
          <span>My Courses</span>
        </Link>
        <Link to="/resources" className="quick-link-card">
          <Glyph name="assignments" />
          <span>Resources</span>
        </Link>
        <Link to="/results" className="quick-link-card">
          <Glyph name="results" />
          <span>Results</span>
        </Link>
        <Link to="/attendance" className="quick-link-card">
          <Glyph name="attendance" />
          <span>Attendance</span>
        </Link>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Recent notifications</h2>
          <Link to="/notifications" className="text-link">See all</Link>
        </div>
        {data.notifications.length === 0 ? (
          <p className="empty">No notifications yet.</p>
        ) : (
          <ul className="notice-list">
            {data.notifications.map((item) => (
              <li key={item._id} className={item.read ? '' : 'unread'}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;
