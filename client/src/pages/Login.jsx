import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Glyph from '../components/Glyph';

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'Demo@123' });

  return (
    <div className="auth-page-modern auth-page-modern">
      <div className="auth-left auth-left">
        <div className="auth-left-content auth-left-content">
          <h2>Welcome to <span className="accent-word">EduTrack</span></h2>
          <p>Your college's complete academic management portal. Manage courses, track attendance, submit assignments, and view results — all in one place.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <Glyph name="courses" />
              <div>
                <strong>Course rooms</strong>
                <p>Only the classes you are enrolled in</p>
              </div>
            </div>
            <div className="auth-feature">
              <Glyph name="attendance" />
              <div>
                <strong>Live attendance</strong>
                <p>Percentages update when teachers mark the day</p>
              </div>
            </div>
            <div className="auth-feature">
              <Glyph name="results" />
              <div>
                <strong>Published GPA</strong>
                <p>Grades and transcripts after faculty release them</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Link to="/" className="auth-logo">
            <img src="/logo-edutrack.png" alt="EduTrack" className="brand-logo" />
            <span>Edu<span className="logo-accent">Track</span></span>
          </Link>
          <h1>Sign in to your account</h1>
          <p className="muted">Approved student, teacher, and admin accounts can sign in here.</p>
          {error && <p className="alert error">{error}</p>}
          <label>
            Email address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@edutrack.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
          </label>
          <button type="submit" className="accent-btn full-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="muted auth-switch">
            New student or teacher? <Link to="/register">Create an account</Link>
          </p>
          <div className="demo-box">
            <p><strong>Demo accounts</strong> (click to fill)</p>
            <div className="demo-btns">
              <button type="button" className="demo-chip" onClick={() => fillDemo('admin@edutrack.com')}>Admin</button>
              <button type="button" className="demo-chip" onClick={() => fillDemo('teacher@edutrack.com')}>Teacher</button>
              <button type="button" className="demo-chip" onClick={() => fillDemo('student@edutrack.com')}>Student</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
