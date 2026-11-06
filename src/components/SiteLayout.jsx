import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { contactInfo } from '../constants/contact';

export default function SiteLayout() {
  const { user, admin, logout } = useAuth();
  const { count, error: cartError } = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const signOut = () => { logout(); navigate('/'); };
  const closeMenu = () => setMenuOpen(false);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/products${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
    setSearchOpen(false);
  };
  return (
    <>
      <div className="announcement">VEDHIKA BRAND <span>✦</span> Elegance in Every Gift, Luxury in Every Detail.</div>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="vedhika home"><span className="brand-mark">V</span><span>vedhika<small>Return Gifts</small></span></Link>
        <nav className={`main-nav ${menuOpen ? 'menu-open' : ''}`}>
          <NavLink onClick={closeMenu} to="/">Home</NavLink>
          <NavLink onClick={closeMenu} to="/return-gifts">Return Gifts</NavLink>
          <NavLink onClick={closeMenu} to="/about">About Us</NavLink>
          <NavLink onClick={closeMenu} to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <button type="button" aria-label="Search products" onClick={() => setSearchOpen(!searchOpen)}><i className="bi bi-search" /></button>
          <Link to={user ? '/wishlist' : '/login'} aria-label={`Wishlist with ${wishlist?.count || 0} items`}><i className="bi bi-heart" /><span>{wishlist?.count || 0}</span></Link>
          <Link to="/cart" className="bag-link" aria-label={`Shopping bag with ${count} items`}><i className="bi bi-bag" /><span>{count}</span></Link>
          <button type="button" className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} /></button>
          <Link to={user ? '/profile' : '/login'} aria-label={user ? 'My profile' : 'Sign in'}><i className="bi bi-person" /></Link>
          {(user || admin) && <button className="sign-out" onClick={signOut}>Sign out</button>}
        </div>
        {searchOpen && <form className="header-search" onSubmit={submitSearch}><input autoFocus aria-label="Search the collection" placeholder="Search return gifts and hampers..." value={search} onChange={(event) => setSearch(event.target.value)} /><button className="button button-dark">Search</button></form>}
      </header>
      <main>{cartError && <div className="alert alert-danger cart-error-banner">{cartError}</div>}<Outlet /></main>
      <footer className="site-footer">
        <div className="footer-main">
          <div><Link className="brand footer-brand" to="/"><span className="brand-mark">V</span><span>VEDHIKA BRAND<small>ELEGANCE IN EVERY GIFT</small></span></Link><p>Bespoke return gifts and artisan hampers<br />for life's most meaningful celebrations.</p></div>
          <div><h3>Customer Care</h3><Link to="/return-gifts">Return Gifts</Link><Link to="/orders">My Orders</Link><Link to="/contact">Contact Us</Link><Link to="/shipping">Shipping & Delivery</Link><Link to="/returns">Returns & Exchanges</Link></div>
          <div><h3>For Every Occasion</h3><Link to="/return-gifts">Explore Return Gifts</Link><Link to="/quote">Request a Quote</Link></div>
          <div><h3>Connect</h3><p><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a><br /><a href={`tel:${contactInfo.phones[0].tel}`}>{contactInfo.phones[0].display}</a><br />Dindigul, Tamil Nadu</p><div className="footer-social"><a href={`mailto:${contactInfo.email}`} aria-label="Email VEDHIKA BRAND"><i className="bi bi-envelope" /></a><a href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with VEDHIKA BRAND on WhatsApp"><i className="bi bi-whatsapp" /></a><a href={contactInfo.directionsUrl} target="_blank" rel="noreferrer" aria-label="Get directions to VEDHIKA BRAND"><i className="bi bi-geo-alt" /></a></div></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} VEDHIKA BRAND</span><span>Elegance in Every Gift, Luxury in Every Detail.</span><Link to="/admin/login">Admin</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></div>
      </footer>
    </>
  );
}
