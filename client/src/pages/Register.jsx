import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Glyph from '../components/Glyph';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  role: 'student',
};

function Register() {
  const { user, requestRegisterOtp, verifyRegisterOtp, resendRegisterOtp } = useAuth();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState(emptyForm);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!form.email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Use a Gmail address. The verification code is sent by Gmail SMTP.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestRegisterOtp(form);
      setInfo(result.message);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const result = await verifyRegisterOtp({ email: form.email, otp });
      setInfo(result.message);
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await resendRegisterOtp(form.email);
      setInfo(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-modern auth-page-modern">
      <div className="auth-left auth-left">
        <div className="auth-left-content auth-left-content">
          <h2>Join <span className="accent-word">EduTrack</span></h2>
          <p>Students and teachers can register with Gmail OTP verification. An administrator must approve the account before login.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <Glyph name="mail" />
              <div>
                <strong>Gmail OTP</strong>
                <p>A 6-digit code confirms the mailbox before the profile is stored.</p>
              </div>
            </div>
            <div className="auth-feature">
              <Glyph name="lock" />
              <div>
                <strong>Admin approval</strong>
                <p>Login stays closed until the campus admin activates the account.</p>
              </div>
            </div>
            <div className="auth-feature">
              <Glyph name="graduate" />
              <div>
                <strong>Student or teacher</strong>
                <p>Pick a role at register. Admin desks are created inside the portal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right auth-right">
        {step === 'form' && (
          <form className="auth-form" onSubmit={sendCode}>
            <Link to="/" className="auth-logo">
              <img src="/logo-edutrack.png" alt="EduTrack" className="brand-logo" />
              <span>Edu<span className="logo-accent">Track</span></span>
            </Link>
            <h1>Create an account</h1>
            <p className="muted">Verify your Gmail, then wait for admin approval before you can sign in.</p>
            {error && <p className="alert error">{error}</p>}
            <div className="role-toggle" role="group" aria-label="Account type">
              <button
                type="button"
                className={form.role === 'student' ? 'role-chip active' : 'role-chip'}
                onClick={() => setForm({ ...form, role: 'student' })}
              >
                Student
              </button>
              <button
                type="button"
                className={form.role === 'teacher' ? 'role-chip active' : 'role-chip'}
                onClick={() => setForm({ ...form, role: 'teacher' })}
              >
                Teacher
              </button>
            </div>
            <div className="form-row">
              <label>
                Full name
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </label>
              <label>
                Gmail
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@gmail.com" required />
              </label>
            </div>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" minLength={6} required />
            </label>
            <div className="form-row">
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
              </label>
              <label>
                Department
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" />
              </label>
            </div>
            <button type="submit" className="accent-btn full-btn" disabled={submitting}>
              {submitting ? 'Sending code...' : 'Send Gmail OTP'}
            </button>
            <p className="muted auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form className="auth-form" onSubmit={confirmCode}>
            <Link to="/" className="auth-logo">
              <img src="/logo-edutrack.png" alt="EduTrack" className="brand-logo" />
              <span>Edu<span className="logo-accent">Track</span></span>
            </Link>
            <h1>Verify your Gmail</h1>
            <p className="muted">Enter the 6-digit code sent to <strong>{form.email}</strong>.</p>
            {error && <p className="alert error">{error}</p>}
            {info && <p className="alert success">{info}</p>}
            <label>
              Verification code
              <input
                className="otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
              />
            </label>
            <button type="submit" className="accent-btn full-btn" disabled={submitting || otp.length !== 6}>
              {submitting ? 'Verifying...' : 'Verify and finish'}
            </button>
            <button type="button" className="ghost-btn full-btn" onClick={resend} disabled={submitting}>
              Resend code
            </button>
            <button type="button" className="text-link" onClick={() => setStep('form')}>
              Change email or details
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="auth-form">
            <Link to="/" className="auth-logo">
              <img src="/logo-edutrack.png" alt="EduTrack" className="brand-logo" />
              <span>Edu<span className="logo-accent">Track</span></span>
            </Link>
            <h1>Registration complete</h1>
            {info && <p className="alert success">{info}</p>}
            <p>Your Gmail is verified. An administrator still needs to approve your {form.role} account before you can log in.</p>
            <Link to="/login" className="accent-btn full-btn">
              Go to login
            </Link>
            <Link to="/" className="ghost-btn full-btn">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
