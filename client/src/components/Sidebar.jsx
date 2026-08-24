import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BrandLogo from './BrandLogo';

const menus = {
  student: [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
    { to: '/courses', label: 'Courses' },
    { to: '/assignments', label: 'Assignments' },
    { to: '/resources', label: 'Resources' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/exams', label: 'Exam Schedule' },
    { to: '/results', label: 'Results' },
    { to: '/notifications', label: 'Notifications' },
  ],
  teacher: [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/courses', label: 'My Courses' },
    { to: '/assignments', label: 'Assignments' },
    { to: '/submissions', label: 'Submissions' },
    { to: '/resources', label: 'Resources' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/exams', label: 'Exams' },
    { to: '/results', label: 'Results' },
    { to: '/notifications', label: 'Notifications' },
  ],
  admin: [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/users', label: 'Users' },
    { to: '/students', label: 'Students' },
    { to: '/teachers', label: 'Teachers' },
    { to: '/courses', label: 'Courses' },
    { to: '/assignments', label: 'Assignments' },
    { to: '/resources', label: 'Resources' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/exams', label: 'Exams' },
    { to: '/results', label: 'Results' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/messages', label: 'Messages' },
    { to: '/settings', label: 'Settings' },
  ],
};

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const items = menus[user.role] || [];

  useEffect(() => {
    api
      .get('/notifications')
      .then((response) => setUnread(response.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <>
      {open && <button type="button" className="sidebar-overlay" onClick={onClose} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <BrandLogo compact />
          <small>{user.role}</small>
        </div>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose}>
              {item.label}
              {item.to === '/notifications' && unread > 0 && <em>{unread}</em>}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="logout-btn"
          onClick={() => {
            logout();
            onClose();
            navigate('/', { replace: true });
          }}
        >
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
