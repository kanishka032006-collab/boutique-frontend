import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AdminLoginPage() {
  const { admin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (admin) return <Navigate to="/admin" replace />;
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await adminLogin(values); navigate('/admin'); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="auth-page admin-login-page"><div className="auth-card"><span className="auth-flower">V</span><p className="eyebrow">VEDHIKA BRAND · BOUTIQUE TEAM</p><h1>Your studio, all in one place.</h1><p>Sign in to manage your collection and orders.</p>{error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit}><label>Admin email<input type="email" autoComplete="username" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} /></label><button className="button button-gold w-100" disabled={busy}>{busy ? 'SIGNING IN…' : 'ENTER THE STUDIO'} <i className="bi bi-arrow-right" /></button></form></div></section>;
}
