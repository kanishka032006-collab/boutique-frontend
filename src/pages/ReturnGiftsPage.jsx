import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const returnGiftSlugs = new Set([
  'wedding-return-gifts',
  'birthday-return-gifts',
  'baby-shower-return-gifts',
  'housewarming-return-gifts',
  'traditional-return-gifts',
  'customized-return-gifts',
]);

export default function ReturnGiftsPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const selectedSlug = params.get('category') || '';

  useEffect(() => {
    Promise.all([api.get('/products?limit=100'), api.get('/categories')])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.data.products.filter((product) => returnGiftSlugs.has(product.category_slug)));
        setCategories(categoryResponse.data.categories.filter((category) => returnGiftSlugs.has(category.slug)));
        setError('');
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  const add = async (product) => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const buy = async (product) => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); navigate('/checkout'); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const selected = categories.find((category) => category.slug === selectedSlug);
  const visibleProducts = selectedSlug ? products.filter((product) => product.category_slug === selectedSlug) : products;

  return <section className="return-gifts-page">
    <div className="return-gifts-hero"><p className="eyebrow">VEDHIKA BRAND · MEANINGFUL THANK-YOUS</p><h1>A gift to remember.<br /><em>A moment to treasure.</em></h1><p>Thoughtful return gifts for weddings, birthdays, baby showers, housewarmings and every gathering worth celebrating.</p><Link className="button button-gold" to="/quote">CURATE A BULK ORDER <i className="bi bi-arrow-up-right" /></Link></div>
    <div className="section return-gifts-collection">
      <div className="section-heading"><div><p className="eyebrow">THE RETURN GIFT COLLECTION</p><h2>{selected?.name || 'Give thanks, beautifully.'}</h2></div><Link className="text-link" to="/quote">BULK & BESPOKE ORDERS →</Link></div>
      <nav className="return-category-list" aria-label="Return gift categories"><Link className={!selectedSlug ? 'active' : ''} to="/return-gifts">All occasions</Link>{categories.map((category) => <Link className={selectedSlug === category.slug ? 'active' : ''} key={category.id} to={`/return-gifts?category=${category.slug}`}>{category.name}</Link>)}</nav>
      {error && <div className="alert alert-danger">{error}</div>}
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={add} onBuy={buy} showDetailsButton />)}</div> : !error && <div className="empty-collection"><span>V</span><h3>{selected ? 'This occasion is ready to be curated.' : 'Our return gift collection is growing.'}</h3><p>Tell VEDHIKA BRAND about your celebration and we’ll help create something meaningful.</p><Link to="/quote" className="button button-gold">REQUEST A BESPOKE QUOTE</Link></div>}
    </div>
  </section>;
}
