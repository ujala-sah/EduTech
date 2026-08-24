import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import UserAvatar from './UserAvatar';

function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" onClick={close}>
          <BrandLogo compact />
        </Link>
        <button type="button" className="menu-btn header-menu" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
        <nav className={open ? 'site-nav open' : 'site-nav'}>
          <div className="site-nav-links">
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/about" onClick={close}>About</NavLink>
            <NavLink to="/blog" onClick={close}>Blog</NavLink>
            <NavLink to="/contact" onClick={close}>Contact</NavLink>
          </div>
          <div className="header-actions">
            {user ? (
              <>
                <Link to="/profile" className="user-chip" onClick={close}>
                  <UserAvatar user={user} />
                  <span className="user-chip-copy">
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                  </span>
                </Link>
                <Link to="/dashboard" className="primary-btn btn-sm" onClick={close}>
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="ghost-btn btn-sm" onClick={close}>Login</Link>
                <Link to="/register" className="accent-btn btn-sm" onClick={close}>Register</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
