import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

function PublicLayout() {
  return (
    <div className="public-shell public-shell">
      <SiteHeader />
      <main className="public-main public-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default PublicLayout;
