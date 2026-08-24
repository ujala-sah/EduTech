import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';

function Attendance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      const [summaryRes, courseRes] = await Promise.all([api.get('/attendance/summary'), api.get('/courses')]);
      setSummary(summaryRes.data);
      setCourses(courseRes.data);
      if (courseRes.data[0]) setSelectedCourse(courseRes.data[0]._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (user.role === 'student' || !selectedCourse) return;
    const course = courses.find((item) => item._id === selectedCourse);
    if (!course) return;
    setRecords(
      (course.students || []).map((student) => ({
        student: student._id,
        name: student.name,
        studentId: student.studentId,
        status: 'present',
      }))
    );
  }, [selectedCourse, courses, user.role]);

  const save = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/attendance', {
        course: selectedCourse,
        date,
        records: records.map((item) => ({ student: item.student, status: item.status })),
      });
      setMessage('Attendance saved.');
      loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Attendance</h1>
          <p className="muted">
            Overall attendance:{' '}
            <strong className={summary?.overallPercentage < 75 ? 'warn-text' : ''}>
              {summary?.overallPercentage || 0}%
            </strong>
          </p>
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {message && <p className="alert success">{message}</p>}
      <section className="panel">
        <h2>{user.role === 'student' ? 'My attendance by course' : 'Attendance overview'}</h2>
        {!summary?.summary?.length ? (
          <p className="empty">No attendance records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {summary.summary.map((item) => (
                <tr key={item.course._id} className={item.percentage < 75 ? 'late-row' : ''}>
                  <td>{item.course.name}</td>
                  <td>{item.present}</td>
                  <td>{item.absent}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {user.role !== 'student' && (
        <section className="panel">
          <h2>Mark attendance</h2>
          <form className="form-grid" onSubmit={save}>
            <label>
              Course
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="full">
              {records.length === 0 ? (
                <p className="empty">No enrolled students in this course.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.student}>
                        <td>{record.name}</td>
                        <td>{record.studentId}</td>
                        <td>
                          <select
                            value={record.status}
                            onChange={(e) => {
                              const next = [...records];
                              next[index] = { ...record, status: e.target.value };
                              setRecords(next);
                            }}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button type="submit" className="primary-btn">
              Save attendance
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default Attendance;
