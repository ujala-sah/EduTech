import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UserAvatar from '../components/UserAvatar';

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    address: user.address || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (photo) data.append('profilePhoto', photo);
      const response = await api.put('/auth/profile', data);
      updateUser(response.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.put('/auth/password', passwordForm);
      setMessage(response.data.message);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>My profile</h1>
      </div>
      {message && <p className="alert success">{message}</p>}
      {error && <p className="alert error">{error}</p>}
      <div className="split">
        <section className="panel">
          <div className="profile-hero">
            <UserAvatar user={user} size="lg" />
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{user.email}</p>
              <p className="muted">{user.role === 'student' ? user.studentId : user.employeeId || user.role}</p>
            </div>
          </div>
          <dl className="details">
            <div>
              <dt>Department</dt>
              <dd>{user.department || '-'}</dd>
            </div>
            <div>
              <dt>Semester</dt>
              <dd>{user.semester || '-'}</dd>
            </div>
            <div>
              <dt>Batch</dt>
              <dd>{user.batch || '-'}</dd>
            </div>
            <div>
              <dt>Enrollment date</dt>
              <dd>{user.enrollmentDate ? new Date(user.enrollmentDate).toLocaleDateString() : '-'}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Edit personal information</h2>
          <form className="form-grid" onSubmit={saveProfile}>
            <label>
              Full name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              Date of birth
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </label>
            <label className="full">
              Address
              <input name="address" value={form.address} onChange={handleChange} />
            </label>
            <label className="full">
              Profile photo
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files[0])} />
            </label>
            <button type="submit" className="primary-btn">
              Save profile
            </button>
          </form>
        </section>
      </div>
      <section className="panel">
        <h2>Change password</h2>
        <form className="form-grid" onSubmit={savePassword}>
          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              required
            />
          </label>
          <button type="submit" className="primary-btn">
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

export default Profile;
