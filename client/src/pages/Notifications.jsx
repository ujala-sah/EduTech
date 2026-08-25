import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', course: '', audience: 'course', type: 'announcement' });

  const load = async () => {
    try {
      const response = await api.get('/notifications');
      setItems(response.data.notifications);
      setUnread(response.data.unreadCount);
      if (user.role !== 'student') {
        const courseRes = await api.get('/courses');
        setCourses(courseRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  const send = async (event) => {
    event.preventDefault();
    try {
      await api.post('/notifications', form);
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
          <h1>Notifications</h1>
          <p className="muted">{unread} unread</p>
        </div>
        <div className="action-row">
          {unread > 0 && (
            <button type="button" className="ghost-btn" onClick={markAll}>
              Mark all read
            </button>
          )}
          {user.role !== 'student' && (
            <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
              Send notification
            </button>
          )}
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="empty">No notifications yet.</p>
      ) : (
        <ul className="notice-list">
          {items.map((item) => (
            <li key={item._id} className={item.isRead ? '' : 'unread'}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small>
                  {item.type} · {new Date(item.createdAt).toLocaleString()}
                </small>
              </div>
              {!item.isRead && (
                <button type="button" className="mark-read-btn" onClick={() => markRead(item._id)}>
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Modal title="Send notification" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={send}>
            <label className="full">
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="full">
              Message
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </label>
            {user.role === 'admin' && (
              <label>
                Audience
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="course">Selected course</option>
                  <option value="all">All users</option>
                </select>
              </label>
            )}
            {form.audience !== 'all' && (
              <label>
                Course
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option value="">All my courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="submit" className="primary-btn">
              Send
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Notifications;
