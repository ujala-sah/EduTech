import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    course: '',
    examDate: '',
    startTime: '',
    endTime: '',
    room: '',
    examType: 'midterm',
    instructions: '',
  });

  const load = async () => {
    try {
      const [examRes, courseRes] = await Promise.all([api.get('/exams'), api.get('/courses')]);
      setExams(examRes.data);
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

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.post('/exams', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (exam) => {
    if (!window.confirm(`Delete ${exam.title}?`)) return;
    try {
      await api.delete(`/exams/${exam._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Exam schedule</h1>
          <p className="muted">Upcoming exams sorted by date</p>
        </div>
        {user.role !== 'student' && (
          <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
            Create exam
          </button>
        )}
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : exams.length === 0 ? (
        <p className="empty">No exams scheduled.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Room</th>
              <th>Type</th>
              {user.role !== 'student' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.title}</td>
                <td>{exam.course?.name}</td>
                <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                <td>
                  {exam.startTime} - {exam.endTime}
                </td>
                <td>{exam.room}</td>
                <td>
                  <span className="badge">{exam.examType}</span>
                </td>
                {user.role !== 'student' && (
                  <td>
                    <button type="button" className="danger" onClick={() => remove(exam)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <Modal title="Create exam" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={save}>
            <label className="full">
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Course
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} required />
            </label>
            <label>
              Start time
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            </label>
            <label>
              End time
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            </label>
            <label>
              Room
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} required />
            </label>
            <label>
              Type
              <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="practical">Practical</option>
              </select>
            </label>
            <label className="full">
              Instructions
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </label>
            <button type="submit" className="primary-btn">
              Save exam
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Exams;
