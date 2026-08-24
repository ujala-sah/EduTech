import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Glyph from '../components/Glyph';

function About() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/public/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="page-hero-wide">
        <p className="eyebrow">About EduTrack</p>
        <h1>A college portal built to replace <span className="accent-word">scattered</span> academic tools.</h1>
        <p>
          EduTrack started as a practical answer to a common campus problem: students checking one place for notes,
          another for attendance, and another for results. This project brings all academic records into one MERN
          application with real authentication, role-based access, and live data.
        </p>
      </section>

      <section className="public-section">
        <div className="split about-split">
          <div className="about-img-wrap">
            <img className="about-image" src="/hero-campus.jpg" alt="Campus courtyard" />
            {stats && (
              <div className="about-stats-overlay">
                <div><strong>{stats.students}</strong><span>Students</span></div>
                <div><strong>{stats.teachers}</strong><span>Teachers</span></div>
                <div><strong>{stats.courses}</strong><span>Courses</span></div>
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Our Mission</p>
            <h2>What the platform does</h2>
            <p>
              Students view enrolled courses, submit assignments, download notes, check attendance, read exam schedules,
              and see published grades. Teachers manage only the courses assigned to them — creating assignments, marking
              attendance, uploading resources, and grading work. Admins create users, courses, and keep the institution's
              records complete.
            </p>
            <p>
              Every dashboard number is loaded from MongoDB through the Express API. There are no hardcoded student
              counts or fake assignment lists. When a teacher marks attendance, the student's percentage updates in real
              time.
            </p>
            <Link to="/contact" className="accent-btn">Contact the team</Link>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Practice</p>
            <h2>What we refuse to ship</h2>
          </div>
        </div>
        <div className="card-grid features-grid">
          <article className="glass-card">
            <h3>No dummy dashboards</h3>
            <p>If MongoDB is empty, the widgets read zero. Seed data exists only for demos, and it still travels through the same API.</p>
          </article>
          <article className="glass-card">
            <h3>No mixed inboxes</h3>
            <p>Students never see another student’s submission. Teachers only open rooms assigned to them.</p>
          </article>
          <article className="glass-card">
            <h3>No surprise lockouts</h3>
            <p>Attendance warnings, late flags, and unpublished grades are visible states — not hidden spreadsheet rules.</p>
          </article>
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Platform Roles</p>
            <h2>How the three <span className="accent-word">roles</span> work</h2>
          </div>
        </div>
        <div className="card-grid public-cards">
          <article className="info-card role-detail-card glass-card">
            <div className="role-card-body">
              <Glyph name="graduate" />
              <h3>Students</h3>
              <ul className="role-features">
                <li>Register publicly and get enrolled by admin</li>
                <li>View courses, submit assignments before deadlines</li>
                <li>Track attendance percentage in real time</li>
                <li>View exam schedules and published results</li>
                <li>Download resources shared by teachers</li>
                <li>Receive notifications for important updates</li>
              </ul>
            </div>
          </article>
          <article className="info-card role-detail-card glass-card">
            <div className="role-card-body">
              <Glyph name="teach" />
              <h3>Teachers</h3>
              <ul className="role-features">
                <li>Manage only assigned courses</li>
                <li>Create assignments with file upload and deadlines</li>
                <li>Mark daily attendance per course</li>
                <li>Upload study materials and resources</li>
                <li>Schedule exams and publish results</li>
                <li>Grade submissions and provide feedback</li>
              </ul>
            </div>
          </article>
          <article className="info-card role-detail-card glass-card">
            <div className="role-card-body">
              <Glyph name="users" />
              <h3>Administrators</h3>
              <ul className="role-features">
                <li>Create and manage all user accounts</li>
                <li>Assign teachers to courses</li>
                <li>View institution-wide analytics</li>
                <li>Handle contact messages from the website</li>
                <li>Configure system settings</li>
                <li>Full read/write access to all data</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Technology</p>
            <h2>Built with the MERN stack</h2>
          </div>
        </div>
        <div className="card-grid tech-grid">
          <article className="tech-card">
            <h3>MongoDB</h3>
            <p>NoSQL database storing all users, courses, assignments, attendance, results, and notifications.</p>
          </article>
          <article className="tech-card">
            <h3>Express.js</h3>
            <p>RESTful API with 13 route groups, JWT authentication, role-based middleware, and file uploads.</p>
          </article>
          <article className="tech-card">
            <h3>React</h3>
            <p>Single-page application with React Router, context-based auth, and responsive component design.</p>
          </article>
          <article className="tech-card">
            <h3>Node.js</h3>
            <p>Server runtime handling concurrent requests, file processing, and real-time data operations.</p>
          </article>
        </div>
      </section>

      <section className="public-section alt">
        <div className="section-head centered">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Project milestones</h2>
          </div>
        </div>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Research &amp; Planning</h3>
              <p>Analyzed campus workflows. Identified pain points in attendance tracking, assignment submission, and result management across departments.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Backend Development</h3>
              <p>Built Express API with Mongoose models, JWT auth, role middleware, file upload, and 13 RESTful route groups.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Frontend &amp; Integration</h3>
              <p>Developed React SPA with role-based dashboards, responsive layouts, and real-time data from the API.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Testing &amp; Deployment</h3>
              <p>Seeded demo data, tested all user flows, and prepared the application for production deployment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner">
          <h2>Want to see it in action?</h2>
          <p>Create a free student account or use the demo credentials to explore every feature.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="accent-btn hero-btn">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="accent-btn hero-btn">Get started free</Link>
                <Link to="/login" className="primary-btn hero-btn">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
