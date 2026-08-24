import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ search: '', course: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', course: '', dueDate: '', maxMarks: 100 });
  const [attachment, setAttachment] = useState(null);

  const load = async () => {
    setError('');
    try {
      const [assignmentRes, courseRes] = await Promise.all([
        api.get('/assignments', { params: filters }),
        api.get('/courses'),
      ]);
      setAssignments(assignmentRes.data);
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
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (attachment) data.append('attachment', attachment);
      await api.post('/assignments', data);
      setOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"?`)) return;
    try {
      await api.delete(`/assignments/${assignment._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitWork = async (event) => {
    event.preventDefault();
    if (!file) return;
    try {
      const data = new FormData();
      data.append('assignmentId', submitOpen._id);
      data.append('file', file);
      await api.post('/submissions', data);
      setSubmitOpen(null);
      setFile(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Assignments</h1>
          <p className="muted">Search, filter, and track deadlines</p>
        </div>
        {user.role !== 'student' && (
          <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
            Create assignment
          </button>
        )}
      </div>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          load();
        }}
      >
        <input
          placeholder="Search by title"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Submitted">Submitted</option>
          <option value="Late">Late</option>
          <option value="Graded">Graded</option>
        </select>
        <button type="submit" className="primary-btn">
          Apply
        </button>
      </form>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : assignments.length === 0 ? (
        <p className="empty">No assignments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Deadline</th>
              <th>Marks</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => (
              <tr key={item._id} className={item.status === 'Late' ? 'late-row' : ''}>
                <td>{item.title}</td>
                <td>{item.course?.name}</td>
                <td>{new Date(item.dueDate).toLocaleString()}</td>
                <td>
                  {item.submission?.marks != null ? `${item.submission.marks}/${item.maxMarks}` : item.maxMarks}
                </td>
                <td>
                  <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                </td>
                <td>
                  {user.role === 'student' && item.status !== 'Graded' && (
                    <button type="button" onClick={() => setSubmitOpen(item)}>
                      Submit
                    </button>
                  )}
                  {user.role !== 'student' && (
                    <button type="button" className="danger" onClick={() => remove(item)}>
                      Delete
                    </button>
                  )}
                  {item.attachment && (
                    <a href={item.attachment} target="_blank" rel="noreferrer">
                      File
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <Modal title="Create assignment" onClose={() => setOpen(false)}>
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
              Due date
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </label>
            <label>
              Maximum marks
              <input
                type="number"
                min="1"
                value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
              />
            </label>
            <label className="full">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="full">
              Attachment
              <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
            </label>
            <button type="submit" className="primary-btn">
              Save assignment
            </button>
          </form>
        </Modal>
      )}
      {submitOpen && (
        <Modal title={`Submit: ${submitOpen.title}`} onClose={() => setSubmitOpen(null)}>
          <form className="form-grid" onSubmit={submitWork}>
            <label className="full">
              Upload file (PDF, DOC, ZIP, or image)
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </label>
            <button type="submit" className="primary-btn">
              Submit assignment
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Assignments;
