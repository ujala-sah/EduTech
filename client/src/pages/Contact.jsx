import { useState } from 'react';

import api from '../services/api';
import Glyph from '../components/Glyph';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const response = await api.post('/public/contact', form);
      setSuccess(response.data.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="page-hero-wide">
        <p className="eyebrow">Contact Us</p>
        <h1>Talk to the EduTrack <span className="accent-word">admin team</span></h1>
        <p>Account help, course questions, and demo requests land in the admin Messages queue. We typically reply within one working day.</p>
      </section>

      <section className="public-section">
        <div className="contact-layout">
          <form className="contact-form-modern" onSubmit={handleSubmit}>
            <h2>Send us a message</h2>
            <p className="muted">We'll get back to you within 24 hours.</p>
            {error && <p className="alert error">{error}</p>}
            {success && <p className="alert success">{success}</p>}
            <div className="form-row">
              <label>
                Full name
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </label>
              <label>
                Email address
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </label>
            </div>
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="What is this about?" required />
            </label>
            <label>
              Message
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your message here..." rows={6} required />
            </label>
            <button type="submit" className="accent-btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>

          <div className="contact-info-side">
            <div className="contact-info-card">
              <Glyph name="users" />
              <h3>Visit us</h3>
              <p>EduTrack Project Desk</p>
              <p>Kathmandu, Nepal</p>
            </div>
            <div className="contact-info-card">
              <Glyph name="mail" />
              <h3>Email us</h3>
              <p>support@edutrack.com</p>
              <p>admin@edutrack.com</p>
            </div>
            <div className="contact-info-card">
              <Glyph name="clock" />
              <h3>Call us</h3>
              <p>+977-1-5550123</p>
              <p>Mon-Fri, 9am - 5pm</p>
            </div>
            <div className="contact-info-card">
              <Glyph name="lock" />
              <h3>Quick help</h3>
              <p>Admin, teacher, and student accounts all use the same login page. Your role determines what you see.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Frequently asked <span className="accent-word">questions</span></h2>
          </div>
        </div>
        <div className="faq-grid">
          <details className="faq-item">
            <summary>How do I create a student account?</summary>
            <p>Click "Get Started" on the homepage. Fill in your name, email, password, phone, and department. After registration, an admin will activate your account and assign you to courses.</p>
          </details>
          <details className="faq-item">
            <summary>Can teachers create their own accounts?</summary>
            <p>Teachers can register with Gmail OTP, the same as students. Login stays closed until an administrator approves the account and assigns courses. Admin desks are created inside the portal, not on the public form.</p>
          </details>
          <details className="faq-item">
            <summary>How do I check my attendance?</summary>
            <p>Log in to your student dashboard. Your overall attendance percentage is shown on the main stat card. For detailed records, visit the Attendance page.</p>
          </details>
          <details className="faq-item">
            <summary>Is my data secure?</summary>
            <p>Yes. Passwords are hashed with bcrypt. Authentication uses JWT tokens. The API enforces role-based access — students cannot see teacher or admin data.</p>
          </details>
          <details className="faq-item">
            <summary>Can I use this on my phone?</summary>
            <p>Yes. EduTrack is fully responsive. The dashboard, assignments, and all pages work on mobile, tablet, and desktop browsers.</p>
          </details>
          <details className="faq-item">
            <summary>How do I reset my password?</summary>
            <p>Contact your administrator through this form or in person. Password resets are handled by admins for security.</p>
          </details>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Campus desk</p>
            <h2>What to include so we can reply faster</h2>
          </div>
        </div>
        <div className="card-grid features-grid">
          <article className="glass-card">
            <Glyph name="mail" />
            <h3>Account access</h3>
            <p>Send the Gmail you registered with, whether you finished OTP, and whether the dashboard still says the account is waiting for approval.</p>
          </article>
          <article className="glass-card">
            <Glyph name="courses" />
            <h3>Course or grade questions</h3>
            <p>Include the course code and your student name. Admins can only check rooms that exist in MongoDB.</p>
          </article>
          <article className="glass-card">
            <Glyph name="spark" />
            <h3>Demo walkthroughs</h3>
            <p>Ask for a reviewer login. The sign-in page can fill Admin, Teacher, and Student demo accounts without changing real campus records.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Contact;
