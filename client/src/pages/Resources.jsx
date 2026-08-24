import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ search: '', course: '', fileType: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '' });
  const [file, setFile] = useState(null);

  const load = async () => {
    setError('');
    try {
      const [resourceRes, courseRes] = await Promise.all([
        api.get('/resources', { params: filters }),
        api.get('/courses'),
      ]);
      setResources(resourceRes.data);
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
      data.append('file', file);
      await api.post('/resources', data);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"?`)) return;
    try {
      await api.delete(`/resources/${resource._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Notes & resources</h1>
          <p className="muted">Lecture notes, slides, and study materials</p>
        </div>
        {user.role !== 'student' && (
          <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
            Upload resource
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
        <select value={filters.fileType} onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}>
          <option value="">All file types</option>
          <option value="pdf">PDF</option>
          <option value="word">DOC</option>
          <option value="image">Image</option>
          <option value="zip">ZIP</option>
        </select>
        <button type="submit" className="primary-btn">
          Apply
        </button>
      </form>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : resources.length === 0 ? (
        <p className="empty">No resources found.</p>
      ) : (
        <div className="card-grid">
          {resources.map((item) => (
            <article className="info-card" key={item._id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className="muted">
                {item.course?.name} · {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="row-actions">
                <a className="primary-btn" href={item.file} target="_blank" rel="noreferrer">
                  Download
                </a>
                {user.role !== 'student' && (
                  <button type="button" className="danger" onClick={() => remove(item)}>
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {open && (
        <Modal title="Upload resource" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={save}>
            <label className="full">
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="full">
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
            <label className="full">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="full">
              File
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </label>
            <button type="submit" className="primary-btn">
              Upload
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Resources;
