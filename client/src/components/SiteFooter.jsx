import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="site-footer site-footer">
      <div className="footer-cta footer-cta">
        <div>
          <p className="eyebrow">Campus portal</p>
          <h2>Courses, attendance, exams, and results in one place.</h2>
        </div>
        {user ? (
          <Link to="/dashboard" className="accent-btn">Open dashboard</Link>
        ) : (
          <div className="footer-cta-actions footer-cta-actions">
            <Link to="/login" className="ghost-btn footer-ghost footer-ghost">Login</Link>
            <Link to="/register" className="accent-btn">Register</Link>
          </div>
        )}
      </div>
      <div className="footer-grid footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <img src="/logo-edutrack.png" alt="" className="brand-logo" />
            Edu<span className="logo-accent">Track</span>
          </Link>
          <p>A student management and learning portal for colleges. Students and teachers register with Gmail OTP, then wait for admin approval before login.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About us</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Portal</h4>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">My profile</Link>
              <Link to="/courses">Courses</Link>
            </>
          ) : (
            <>
              <Link to="/login">Student &amp; teacher login</Link>
              <Link to="/register">Create account</Link>
              <Link to="/contact">Request a demo</Link>
            </>
          )}
        </div>
        <div>
          <h4>Support</h4>
          <p>support@edutrack.com</p>
          <p>+977-1-5550123</p>
          <p>Kathmandu, Nepal</p>
        </div>
      </div>
      <div className="footer-bottom footer-bottom">
        <span>© {new Date().getFullYear()} EduTrack. All rights reserved.</span>
        <span>Gmail OTP verification · Admin-approved access</span>
      </div>
    </footer>
  );
}

export default SiteFooter;
