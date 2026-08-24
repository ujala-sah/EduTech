import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student: '', course: '', marks: '' });
  const [students, setStudents] = useState([]);

  const load = async () => {
    try {
      const [resultRes, courseRes] = await Promise.all([api.get('/results'), api.get('/courses')]);
      setResults(resultRes.data.results);
      setGpa(resultRes.data.gpa);
      setCourses(courseRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const course = courses.find((item) => item._id === form.course);
    setStudents(course?.students || []);
  }, [form.course, courses]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.post('/results', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Results & grades</h1>
          {user.role === 'student' && <p className="muted">GPA: {gpa ?? 0}</p>}
        </div>
        {user.role !== 'student' && (
          <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
            Add result
          </button>
        )}
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <p className="empty">No results published yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {user.role !== 'student' && <th>Student</th>}
              <th>Course</th>
              <th>Exam</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Grade point</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={item._id} className={item.grade === 'F' ? 'late-row' : ''}>
                {user.role !== 'student' && <td>{item.student?.name}</td>}
                <td>{item.course?.name}</td>
                <td>{item.exam?.title || '-'}</td>
                <td>{item.marks}</td>
                <td>
                  <span className="badge">{item.grade}</span>
                </td>
                <td>{item.gradePoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <Modal title="Add result" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={save}>
            <label>
              Course
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, student: '' })} required>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Student
              <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Marks (0-100)
              <input
                type="number"
                min="0"
                max="100"
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Publish result
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Results;
