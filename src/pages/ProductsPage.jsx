import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchDraft, setSearchDraft] = useState(search);
  const { addItem } = useCart();
  const { user } = useAuth();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'name';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';

  useEffect(() => { setSearchDraft(search); }, [search]);
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.categories)).catch((e) => setError(getErrorMessage(e))); }, []);
  useEffect(() => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (sort) query.set('sort', sort);
    if (minPrice) query.set('minPrice', minPrice);
    if (maxPrice) query.set('maxPrice', maxPrice);
    api.get(`/products?${query}`).then(({ data }) => { setProducts(data.products); setError(''); }).catch((e) => setError(getErrorMessage(e)));
  }, [search, category, sort, minPrice, maxPrice]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    update('search', searchDraft.trim());
  };
  const add = async (product) => {
    setMessage('');
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); setMessage(`${product.name} added to your bag.`); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  const buy = async (product) => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); navigate('/checkout'); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  const selected = categories.find((item) => item.slug === category);
  return (
    <section className="shop-page section">
      <div className="shop-intro"><p className="eyebrow">VEDHIKA BRAND · CURATED COLLECTIONS</p><h1>{selected?.name || 'The VEDHIKA Collections'}</h1><p>Authentic handloom, heritage silks and considered gifts for your most meaningful occasions.</p></div>
      <div className="shop-controls">
        <form className="search-field" role="search" onSubmit={submitSearch}><i className="bi bi-search" /><input aria-label="Search products" value={searchDraft} onChange={(e) => setSearchDraft(e.target.value)} placeholder="Search sarees, gifts and hampers..." /><button className="button button-dark" type="submit">Search</button></form>
        <select value={category} onChange={(e) => update('category', e.target.value)} aria-label="Filter by collection"><option value="">All collections</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select>
        <select value={sort} onChange={(e) => update('sort', e.target.value)} aria-label="Sort products"><option value="name">Featured</option><option value="newest">Newest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
        <details className="price-filter"><summary><i className="bi bi-sliders" /> Price</summary><div className="price-filter-box"><input type="number" min="0" placeholder="Min ₹" value={minPrice} onChange={(e) => update('minPrice', e.target.value)} /><input type="number" min="0" placeholder="Max ₹" value={maxPrice} onChange={(e) => update('maxPrice', e.target.value)} /></div></details>
      </div>
      {message && <div className="alert alert-success">{message} <Link to="/cart">View bag →</Link></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <p className="result-count">{products.length} {products.length === 1 ? 'piece' : 'pieces'} in this collection</p>
      {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={add} onBuy={buy} />)}</div> : <div className="empty-collection"><span>V</span><h3>Nothing in this collection just yet.</h3><p>Try a different collection or ask us to curate something for your occasion.</p><Link to="/quote" className="button button-outline">Request a bespoke quote</Link></div>}
    </section>
  );
}
