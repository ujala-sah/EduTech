import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main app-main">
        <Navbar onMenu={() => setMenuOpen(true)} />
        <div className="page-wrap page-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
