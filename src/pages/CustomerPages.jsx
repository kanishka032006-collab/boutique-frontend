import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export function LoginPage() {
  const { login } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await login(values);
      setSignedIn(true);
      if (location.state?.pendingProductId) {
        try {
          await addItem(Number(location.state.pendingProductId), Number(location.state.pendingQuantity || 1));
        } catch (e) {
          setError(`You are signed in, but the item could not be added: ${getErrorMessage(e)}. You can continue shopping and add it again.`);
          return;
        }
        navigate(location.state.continueTo === '/cart' ? '/cart' : '/checkout');
      } else {
        navigate(typeof location.state?.from === 'string' ? location.state.from : location.state?.from?.pathname || '/products');
      }
    }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="auth-page"><div className="auth-card"><span className="auth-flower">V</span><p className="eyebrow">VEDHIKA BRAND · CLIENT ACCOUNT</p><h1>Welcome back.</h1><p>Sign in to explore your orders and saved collections.</p>{location.state?.notice && <div className="alert alert-success">{location.state.notice}</div>}{error && <div className="alert alert-danger">{error}</div>}{signedIn ? <Link className="button button-gold w-100" to="/products">CONTINUE SHOPPING <i className="bi bi-arrow-right" /></Link> : <form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} /></label><button className="button button-gold w-100" disabled={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'} <i className="bi bi-arrow-right" /></button></form>}<p className="auth-switch"><Link to="/forgot-password">Forgot your password?</Link></p><p className="auth-switch">New to VEDHIKA BRAND? <Link to="/register" state={location.state}>Create an account</Link></p></div></section>;
}

const blankRegistrationAddress = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export function RegisterPage() {
  const { register } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', address: blankRegistrationAddress });
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    const address = { ...values.address, fullName: values.name, phone: values.phone };
    try {
      await register({ ...values, address });
      setAccountCreated(true);
      if (location.state?.pendingProductId) {
        try {
          await addItem(Number(location.state.pendingProductId), Number(location.state.pendingQuantity || 1));
        } catch (e) {
          setError(`Your account and address are saved, but the item could not be added: ${getErrorMessage(e)}. You can continue shopping and add it again.`);
          return;
        }
        navigate(location.state.continueTo === '/cart' ? '/cart' : '/checkout', { state: { address } });
      } else {
        navigate('/products');
      }
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const updateAddress = (key) => (event) => setValues((current) => ({
    ...current,
    address: { ...current.address, [key]: event.target.value },
  }));
  return <section className="auth-page"><div className="auth-card register-card"><span className="auth-flower">V</span><p className="eyebrow">VEDHIKA BRAND · CLIENT ACCOUNT</p><h1>Create your account.</h1><p>Save your delivery address and continue to checkout.</p>{error && <div className="alert alert-danger">{error}</div>}{accountCreated ? <Link className="button button-gold w-100" to="/products">CONTINUE SHOPPING <i className="bi bi-arrow-right" /></Link> : <form onSubmit={submit}><label>Full name<input autoComplete="name" required minLength="2" maxLength="120" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></label><label>Email address<input type="email" autoComplete="email" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} /></label><label>Phone number<input type="tel" autoComplete="tel" required minLength="7" maxLength="30" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} /></label><label>Password <span className="optional">(10 characters minimum)</span><input type="password" autoComplete="new-password" required minLength="10" maxLength="128" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} /></label><h2 className="register-address-heading">Delivery address</h2><label className="register-form-span">House no. / building name<input required minLength="4" maxLength="200" autoComplete="address-line1" value={values.address.addressLine1} onChange={updateAddress('addressLine1')} /></label><label className="register-form-span">Road name / area / colony<input required minLength="2" maxLength="200" autoComplete="address-line2" value={values.address.addressLine2} onChange={updateAddress('addressLine2')} /></label><label>PIN code<input required minLength="3" maxLength="20" autoComplete="postal-code" value={values.address.postalCode} onChange={updateAddress('postalCode')} /></label><label>City<input required minLength="2" maxLength="100" autoComplete="address-level2" value={values.address.city} onChange={updateAddress('city')} /></label><label className="register-form-span">State<input required minLength="2" maxLength="100" autoComplete="address-level1" value={values.address.state} onChange={updateAddress('state')} /></label><button className="button button-gold w-100 register-form-span" disabled={busy}>{busy ? 'SAVING ADDRESS…' : 'SAVE ADDRESS AND CONTINUE'} <i className="bi bi-arrow-right" /></button></form>}<p className="auth-switch">Already have an account? <Link to="/login" state={location.state}>Sign in</Link></p></div></section>;
}

export function CartPage() {
  const { items, subtotal, setQuantity, removeItem, loading } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const update = async (action) => { setError(''); try { await action(); } catch (e) { setError(getErrorMessage(e)); } };
  if (!user) return <section className="section empty-collection"><span>♡</span><h2>Your bag is waiting.</h2><p>Sign in to add keepsakes to your bag and keep everything together.</p><Link className="button button-dark" to="/login">Sign in to continue</Link></section>;
  if (loading) return <section className="section loading-copy">Opening your bag...</section>;
  return <section className="section cart-page"><p className="eyebrow">VEDHIKA BRAND · YOUR SELECTION</p><h1>Your shopping bag</h1>{error && <div className="alert alert-danger">{error}</div>}{!items.length ? <div className="empty-collection"><span>V</span><h3>Your bag is taking a little nap.</h3><p>Find a keepsake that's just right for your celebration.</p><Link className="button button-gold" to="/products">Browse the collection</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.id}><Link to={`/products/${item.slug}`} className="cart-thumbnail">{item.image_url ? <img src={item.image_url.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000'}${item.image_url}`} alt={item.name} /> : <span>V</span>}</Link><div className="cart-item-info"><Link to={`/products/${item.slug}`}>{item.name}</Link><span>₹{Number(item.price).toLocaleString('en-IN')} each</span>{item.is_customizable && <small><i className="bi bi-stars" /> Personalization at checkout</small>}<button className="remove-link" onClick={() => update(() => removeItem(item.id))}>Remove</button></div><div className="quantity-control"><button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => update(() => setQuantity(item.id, item.quantity - 1))}>−</button><span>{item.quantity}</span><button aria-label="Increase quantity" disabled={item.quantity >= item.stock} onClick={() => update(() => setQuantity(item.id, item.quantity + 1))}>+</button></div><strong>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</strong></article>)}</div><aside className="order-summary"><h2>Your order summary</h2><div><span>Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><div><span>Delivery</span><span>Complimentary</span></div><p>Standard delivery is complimentary. The amount shown is the cash-on-delivery total.</p><Link to="/checkout" className="button button-gold w-100">Continue to checkout <i className="bi bi-arrow-right" /></Link><Link to="/products" className="summary-continue"><i className="bi bi-arrow-left" /> Keep browsing</Link></aside></div>}</section>;
}

const blankAddress = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India' };

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const routeAddress = location.state?.address;
  const [address, setAddress] = useState({ ...blankAddress, ...routeAddress, fullName: routeAddress?.fullName || user?.name || '', phone: routeAddress?.phone || user?.phone || '' });
  const [step, setStep] = useState(routeAddress ? 'payment' : 'address');
  const [customizations, setCustomizations] = useState({});
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => {
    if (!user || routeAddress) return undefined;
    let active = true;
    api.get('/auth/profile')
      .then(({ data }) => {
        if (!active || !data.address) return;
        setAddress((current) => ({
          ...current,
          ...data.address,
          fullName: data.address.fullName || user.name || current.fullName,
          phone: data.address.phone || user.phone || current.phone,
        }));
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      });
    return () => { active = false; };
  }, [user, routeAddress]);
  useEffect(() => {
    if (step !== 'payment') {
      setDeliveryQuote(null);
      setQuoteError('');
      return undefined;
    }
    let active = true;
    setQuoteLoading(true);
    setDeliveryQuote(null);
    setQuoteError('');
    api.post('/delivery/quote', { shippingAddress: address })
      .then(({ data }) => { if (active) setDeliveryQuote(data); })
      .catch((requestError) => { if (active) setQuoteError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setQuoteLoading(false); });
    return () => { active = false; };
  }, [step, address, quoteAttempt]);
  if (!user) return null;
  if (!items.length) return <section className="section empty-collection"><span>♡</span><h2>Your bag is empty.</h2><Link to="/products" className="button button-dark">Browse gifts</Link></section>;
  const saveAddressAndContinue = async () => {
    const { data } = await api.patch('/auth/profile', { name: address.fullName, phone: address.phone, address });
    setAddress({ ...blankAddress, ...data.address });
    setStep('payment');
  };
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (step === 'address') {
        await saveAddressAndContinue();
        return;
      }
      const { data } = await api.post('/orders/checkout', { shippingAddress: address, notes, customizations: Object.entries(customizations).map(([productId, values]) => ({ productId: Number(productId), ...values })) });
      clear();
      navigate('/orders', { state: { notice: `Order #${data.order.id} is placed. Thank you for choosing us!` } });
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="section checkout-page"><p className="eyebrow">VEDHIKA BRAND · SECURE CHECKOUT</p><h1>{step === 'address' ? 'Where shall we send it?' : 'Review and confirm your order.'}</h1><div className="checkout-step-indicator"><span className={step === 'address' ? 'active' : 'complete'}>01 <b>Delivery address</b></span><i className="bi bi-arrow-right" /><span className={step === 'payment' ? 'active' : ''}>02 <b>Payment & confirmation</b></span></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-form">{step === 'address' ? <><div className="checkout-panel"><h2>Delivery details</h2><div className="form-grid"><label>Full name<input required minLength="2" maxLength="120" autoComplete="name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} /></label><label>Phone number<input required minLength="7" maxLength="30" autoComplete="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></label><label className="form-span">House no. / building name<input required minLength="4" maxLength="200" autoComplete="address-line1" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} /></label><label className="form-span">Road name / area / colony<input required minLength="2" maxLength="200" autoComplete="address-line2" value={address.addressLine2} onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })} /></label><label>PIN code<input required minLength="3" maxLength="20" autoComplete="postal-code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></label><label>City<input required minLength="2" maxLength="100" autoComplete="address-level2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></label><label className="form-span">State<input required minLength="2" maxLength="100" autoComplete="address-level1" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></label></div></div>
      {items.some((item) => item.is_customizable) && <div className="checkout-panel"><h2>Make it personal <span className="optional">(optional)</span></h2>{items.filter((item) => item.is_customizable).map((item) => <div className="customization-fields" key={item.product_id}><strong>{item.name}</strong><label>Printed name<input maxLength="120" placeholder="A name to print on the gift" value={customizations[item.product_id]?.printedName || ''} onChange={(e) => setCustomizations({ ...customizations, [item.product_id]: { ...customizations[item.product_id], printedName: e.target.value } })} /></label><label>Gift message<textarea rows="2" maxLength="500" placeholder="A little note from you..." value={customizations[item.product_id]?.giftMessage || ''} onChange={(e) => setCustomizations({ ...customizations, [item.product_id]: { ...customizations[item.product_id], giftMessage: e.target.value } })} /></label></div>)}</div>}
      <div className="checkout-panel"><h2>Anything else?</h2><label>Order notes <span className="optional">(optional)</span><textarea rows="3" maxLength="1000" placeholder="Event date, bulk-order details, or delivery instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} /></label></div></> : <><div className="checkout-panel"><h2>Delivery address <button type="button" className="checkout-edit-link" onClick={() => setStep('address')}>Edit</button></h2><div className="checkout-address-summary"><strong>{address.fullName}</strong><span>{address.phone}</span><span>{address.addressLine1}</span><span>{address.addressLine2}</span><span>{address.city}, {address.state} {address.postalCode}</span><span>{address.country}</span></div></div><div className="checkout-panel"><h2>Choose payment method</h2><label className="payment-option"><input type="radio" name="payment-method" value="cash_on_delivery" defaultChecked /><span><strong>Cash on delivery</strong><small>Pay when your order arrives.</small></span><i className="bi bi-cash-coin" /></label><p className="checkout-terms">Online payments are not available yet. Pay the delivery agent when your order arrives.</p></div></>}</div>
      <aside className="order-summary"><h2>Your selection</h2>{items.map((item) => <div className="summary-item" key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</strong></div>)}<div className="summary-total"><span>Subtotal</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div>{deliveryQuote?.enabled ? <><div className="summary-total"><span>Delivery distance</span><strong>{Number(deliveryQuote.distance_km).toFixed(2)} KM</strong></div><div className="summary-total"><span>COD charge (₹{Number(deliveryQuote.rate_per_km).toFixed(2)}/KM)</span><strong>₹{Number(deliveryQuote.cod_charge).toFixed(2)}</strong></div></> : deliveryQuote ? <div className="summary-total"><span>Delivery</span><strong>Complimentary</strong></div> : <div className="summary-total"><span>Delivery charge</span><strong>{step === 'payment' && quoteLoading ? 'Calculating…' : 'Calculated after address'}</strong></div>}{quoteError && <div className="alert alert-danger">{quoteError}<button type="button" className="text-button" onClick={() => setQuoteAttempt((attempt) => attempt + 1)}>Try again</button></div>}{error && <div className="alert alert-danger">{error}</div>}<button type="submit" className="button button-gold w-100" disabled={busy || (step === 'payment' && (quoteLoading || !deliveryQuote))}>{busy ? (step === 'address' ? 'SAVING ADDRESS…' : 'CONFIRMING ORDER…') : (step === 'address' ? 'SAVE ADDRESS AND CONTINUE' : 'CONFIRM ORDER')} <i className="bi bi-arrow-right" /></button>{step === 'payment' && <small className="checkout-terms">Your order will be placed with cash on delivery.</small>}</aside></form></section>;
}

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then(({ data }) => setOrders(data.orders)).catch((e) => setError(getErrorMessage(e)));
  }, [user, navigate]);
  const cancelOrder = async (order) => {
    if (!window.confirm(`Cancel order #${order.id}? Each order can only be cancelled once, and this cannot be undone.`)) return;
    setCancellingOrderId(order.id);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/orders/${order.id}/cancel`);
      setOrders((current) => current.map((item) => item.id === order.id ? data.order : item));
      setNotice(`Order #${order.id} cancelled. This order cannot be cancelled again.`);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setCancellingOrderId(null); }
  };
  if (!user) return null;
  return <section className="section orders-page"><p className="eyebrow">VEDHIKA BRAND · CLIENT ACCOUNT</p><h1>My Orders</h1><p className="order-cancel-policy">Each order can be cancelled only once. Cancellation cannot be undone.</p>{notice && <div className="alert alert-success">{notice}</div>}{error && <div className="alert alert-danger">{error}</div>}{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-head"><div><span className="eyebrow">ORDER #{order.id}</span><p>{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p></div><span className={`status-pill status-${order.status}`}>{order.status}</span></div><div className="order-items">{order.items.map((item, index) => <div key={`${order.id}-${index}`}><span>{item.name} × {item.quantity}</span><strong>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</strong>{(item.giftMessage || item.printedName) && <small>{item.printedName && `Printed: ${item.printedName}`} {item.giftMessage && `· “${item.giftMessage}”`}</small>}</div>)}</div><div className="order-foot"><span>{order.payment_method === 'cash_on_delivery' ? 'Cash on delivery' : order.payment_method}</span><strong>Total · ₹{Number(order.total || order.subtotal).toLocaleString('en-IN')}</strong></div><div className="order-address"><i className="bi bi-geo-alt" /><span>Delivering to {order.shipping_address.fullName}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}</span></div>{['pending', 'confirmed'].includes(order.status) && <button className="button button-outline order-cancel-button" type="button" disabled={cancellingOrderId === order.id} onClick={() => cancelOrder(order)}>{cancellingOrderId === order.id ? 'CANCELLING…' : 'CANCEL ORDER'}</button>}</article>)}</div> : !error && <div className="empty-collection"><span>V</span><h3>Your VEDHIKA BRAND orders will appear here.</h3><p>Explore the collections and find a piece for your next occasion.</p><Link to="/products" className="button button-gold">EXPLORE COLLECTIONS</Link></div>}</section>;
}

export function WishlistPage() {
  const { user } = useAuth();
  const wishlist = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;
  const remove = async (item) => {
    try { await wishlist.toggle(item.product); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const add = async (product) => {
    try { await addItem(product.id); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  return <section className="section wishlist-page"><p className="eyebrow">VEDHIKA BRAND · YOUR PRIVATE EDIT</p><h1>My Wishlist</h1>{error && <div className="alert alert-danger">{error}</div>}{wishlist.error && <div className="alert alert-danger">{wishlist.error}</div>}{wishlist.items.length ? <div className="product-grid">{wishlist.items.map(({ product }) => <div className="wishlist-card" key={product.id}><ProductCard product={product} onAdd={add} onBuy={async (selection) => { await add(selection); navigate('/checkout'); }} /><button className="remove-link" onClick={() => remove({ product })}>REMOVE FROM WISHLIST</button></div>)}</div> : <div className="empty-collection"><span>V</span><h3>Your edit is waiting to be curated.</h3><p>Save the pieces that speak to you as you explore VEDHIKA BRAND.</p><Link to="/products" className="button button-gold">DISCOVER THE COLLECTIONS</Link></div>}</section>;
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.patch('/auth/profile', values);
      updateUser(data.user);
      setValues({ name: data.user.name, phone: data.user.phone || '' });
      setNotice('Your profile has been updated.');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  if (!user) return null;
  return <section className="auth-page"><div className="auth-card"><span className="auth-flower">V</span><p className="eyebrow">VEDHIKA BRAND · CLIENT ACCOUNT</p><h1>My Profile</h1><p>Keep your contact details up to date.</p>{error && <div className="alert alert-danger">{error}</div>}{notice && <div className="alert alert-success">{notice}</div>}<form onSubmit={submit}><label>Your name<input required minLength="2" maxLength="120" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label><label>Email address<input type="email" value={user.email} disabled /></label><label>Phone number<input type="tel" maxLength="30" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} /></label><button className="button button-gold w-100" disabled={busy}>{busy ? 'SAVING…' : 'SAVE PROFILE'}</button></form><p className="auth-switch"><Link to="/orders">View my orders</Link></p></div></section>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try { const { data } = await api.post('/auth/forgot-password', { email }); setNotice(data.message); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  return <section className="auth-page"><div className="auth-card"><span className="auth-flower">V</span><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Reset your password.</h1><p>Enter your account email and we’ll send password reset instructions.</p>{error && <div className="alert alert-danger">{error}</div>}{notice && <div className="alert alert-success">{notice}</div>}<form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="button button-gold w-100" disabled={busy}>{busy ? 'SENDING…' : 'SEND RESET LINK'}</button></form><p className="auth-switch"><Link to="/login">Return to sign in</Link></p></div></section>;
}

export function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await api.post('/auth/reset-password', { uid, token, newPassword: password });
      navigate('/login', { state: { notice: 'Your password has been updated. Please sign in.' } });
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  return <section className="auth-page"><div className="auth-card"><span className="auth-flower">V</span><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Choose a new password.</h1>{error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit}><label>New password<input type="password" autoComplete="new-password" minLength="10" maxLength="128" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button-gold w-100" disabled={busy}>{busy ? 'UPDATING…' : 'UPDATE PASSWORD'}</button></form></div></section>;
}
