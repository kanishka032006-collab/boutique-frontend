import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin"><span className="brand-mark">V</span><span>VEDHIKA BRAND<small>STUDIO ADMIN</small></span></a>
        <nav>
          <NavLink end to="/admin"><i className="bi bi-grid" /> Overview</NavLink>
          <NavLink to="/admin/products"><i className="bi bi-box-seam" /> Products</NavLink>
          <NavLink to="/admin/orders"><i className="bi bi-receipt" /> Orders</NavLink>
          <NavLink to="/admin/customers"><i className="bi bi-people" /> Customers</NavLink>
          <NavLink to="/admin/messages"><i className="bi bi-chat-dots" /> Messages</NavLink>
          <NavLink to="/admin/quotations"><i className="bi bi-envelope-paper" /> Quotations</NavLink>
          <NavLink to="/admin/categories"><i className="bi bi-tags" /> Categories</NavLink>
          <NavLink to="/admin/delivery-charge-settings"><i className="bi bi-geo-alt" /> Delivery Charge Settings</NavLink>
          <NavLink to="/admin/reports"><i className="bi bi-bar-chart" /> Reports</NavLink>
        </nav>
        <button className="admin-logout" onClick={() => { logout(); navigate('/admin/login'); }}><i className="bi bi-box-arrow-left" /> Sign out</button>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><span className="eyebrow">BOUTIQUE MANAGEMENT</span><h2>Good day, {admin?.name?.split(' ')[0] || 'there'}</h2></div><a href="/" className="view-store"><i className="bi bi-arrow-up-right" /> View storefront</a></header>
        <div className="admin-content"><Outlet /></div>
      </section>
    </div>
  );
}
