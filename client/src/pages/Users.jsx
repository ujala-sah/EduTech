import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

function Users({ forcedRole }) {
  const location = useLocation();
  const defaultRole = forcedRole || (location.pathname.includes('students') ? 'student' : location.pathname.includes('teachers') ? 'teacher' : '');
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: defaultRole, status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole || 'student',
    department: '',
    semester: '',
    batch: '',
  });

  const load = async () => {
    setError('');
    try {
      const response = await api.get('/users', { params: filters });
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters((current) => ({ ...current, role: defaultRole }));
  }, [defaultRole]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [filters.role]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.post('/users', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (user) => {
    try {
      await api.patch(`/users/${user._id}/status`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const approve = async (user, approved) => {
    try {
      await api.patch(`/users/${user._id}/approval`, { approved });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (user) => {
    const ok = window.confirm(
      `Delete ${user.name} (${user.email})? This cannot be undone. They can register again with the same Gmail after deletion.`
    );
    if (!ok) return;
    try {
      await api.delete(`/users/${user._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const title = defaultRole === 'student' ? 'Students' : defaultRole === 'teacher' ? 'Teachers' : 'Users';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">Search by name or email. Pending accounts need approval before they can log in.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setOpen(true)}>
          Add user
        </button>
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
          placeholder="Search name or email"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        {!defaultRole && (
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
            <option value="pending">Pending approval</option>
            <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="primary-btn">
          Search
        </button>
      </form>
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <p className="empty">No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>ID</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  <span className={`badge ${item.role}`}>{item.role}</span>
                </td>
                <td>{item.studentId || item.employeeId || '-'}</td>
                <td>
                  {item.isApproved === false ? (
                    <span className="badge pending">Pending</span>
                  ) : item.isActive ? (
                    <span className="badge graded">Active</span>
                  ) : (
                    <span className="badge late">Inactive</span>
                  )}
                </td>
                <td className="row-actions">
                  {item.isApproved === false && item.role !== 'admin' ? (
                    <>
                      <button type="button" className="primary-btn" onClick={() => approve(item, true)}>
                        Approve
                      </button>
                      <button type="button" className="danger-btn" onClick={() => approve(item, false)}>
                        Decline
                      </button>
                    </>
                  ) : item.role !== 'admin' ? (
                    <button type="button" onClick={() => toggle(item)}>
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  ) : null}
                  {item.role !== 'admin' && (
                    <button type="button" className="danger-btn" onClick={() => remove(item)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <Modal title="Create user" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={save}>
            <label>
              Full name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Department
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </label>
            <label>
              Semester
              <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
            </label>
            <button type="submit" className="primary-btn">
              Create user
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Users;
