import { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await api.get('/messages');
      setMessages(response.data);
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
    await api.put(`/messages/${id}/read`);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Contact messages</h1>
          <p className="muted">Messages submitted from the public Contact page</p>
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : messages.length === 0 ? (
        <p className="empty">No contact messages yet.</p>
      ) : (
        <ul className="notice-list">
          {messages.map((item) => (
            <li key={item._id} className={item.isRead ? '' : 'unread'}>
              <div>
                <strong>{item.subject}</strong>
                <p>
                  {item.name} · {item.email}
                </p>
                <p>{item.message}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              {!item.isRead && (
                <button type="button" onClick={() => markRead(item._id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Messages;
