import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import UserAvatar from './UserAvatar';

function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onMenu} aria-label="Open menu">
        ☰
      </button>
      <Link to="/" className="topbar-title">
        <BrandLogo compact />
      </Link>
      <nav className="topbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <div className="topbar-user">
        <Link to="/profile" className="user-chip">
          <UserAvatar user={user} />
          <span className="user-chip-copy">
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </span>
        </Link>
        <button type="button" className="danger-btn btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
