import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { addItem } = useCart();
  const { user } = useAuth();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  useEffect(() => {
    Promise.all([api.get(`/products/${slug}`), api.get('/products?limit=6')])
      .then(([detail, collection]) => {
        setProduct(detail.data.product);
        setRelated(collection.data.products.filter((item) => item.slug !== slug).slice(0, 4));
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [slug]);
  const add = async () => {
    if (!user) {
      navigate('/register', { state: { pendingProductId: product.id, pendingQuantity: quantity, continueTo: '/cart' } });
      return;
    }
    try { await addItem(product.id, quantity); setMessage('Added to your bag. A lovely choice!'); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  const buy = async () => {
    if (!user) {
      navigate('/register', { state: { pendingProductId: product.id, pendingQuantity: quantity, continueTo: '/checkout' } });
      return;
    }
    try { await addItem(product.id, quantity); navigate('/checkout'); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const saved = await wishlist.toggle(product);
      setMessage(saved ? 'Added to your wishlist.' : 'Removed from your wishlist.');
    } catch (e) { setError(getErrorMessage(e)); }
  };
  if (error && !product) return <div className="section"><div className="alert alert-danger">{error}</div><Link to="/products">Back to the collection</Link></div>;
  if (!product) return <div className="section loading-copy">Finding something lovely...</div>;
  const image = activeImage || product.images.find((item) => item.primary) || product.images[0];
  return (
    <section className="section detail-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/products">Collections</Link><span>/</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery"><div className="detail-image">{image ? <img src={image.url} alt={image.alt_text || product.name} /> : <div className="product-image-placeholder detail-placeholder"><span>V</span><small>VEDHIKA BRAND</small></div>}</div>{product.images.length > 1 && <div className="detail-thumbnails">{product.images.map((item) => <button key={item.id} className={image?.id === item.id ? 'active' : ''} onClick={() => setActiveImage(item)} aria-label={`View ${item.alt_text || product.name}`}><img src={item.url} alt="" /></button>)}</div>}</div>
        <div className="detail-copy"><p className="eyebrow">{product.category_name || 'VEDHIKA BRAND COLLECTION'}</p><h1>{product.name}</h1><p className="detail-price">{product.offer_percentage > 0 && <span className="detail-offer-badge">{product.offer_percentage}% OFF</span>}<strong>₹{Number(product.final_price ?? product.price).toLocaleString('en-IN')}</strong>{product.offer_percentage > 0 && <del>₹{Number(product.price).toLocaleString('en-IN')}</del>}</p><p className="detail-description">{product.description}</p><p className={`stock-note ${product.stock > 0 ? '' : 'out-of-stock'}`}><span />{product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}</p>
          {product.is_customizable && <div className="custom-note"><i className="bi bi-stars" /><span><strong>Made personal.</strong> Add a gift message or printed name at checkout.</span></div>}
          {error && <div className="alert alert-danger">{error}</div>}{message && <div className="alert alert-success">{message} <Link to="/wishlist">View wishlist</Link></div>}
          <div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>+</button></div><button className="button button-outline" onClick={add} disabled={product.stock < 1}>ADD TO CART</button><button className="button button-gold" onClick={buy} disabled={product.stock < 1}>BUY NOW</button></div>
          <button className={`detail-wishlist ${wishlist?.has(product.id) ? 'is-saved' : ''}`} onClick={toggleWishlist}><i className={`bi ${wishlist?.has(product.id) ? 'bi-heart-fill' : 'bi-heart'}`} /> {wishlist?.has(product.id) ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}</button>
          <div className="detail-perks"><span><i className="bi bi-gem" /> Artisan selected</span><span><i className="bi bi-truck" /> Bespoke delivery</span></div>
        </div>
      </div>
      {related.length > 0 && <div className="related-products"><div className="section-heading"><div><p className="eyebrow">CONTINUE EXPLORING</p><h2>Consider these <em>as well.</em></h2></div><Link className="text-link" to="/products">VIEW COLLECTIONS →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} onAdd={async (selection) => { if (!user) return navigate('/login'); await addItem(selection.id); }} onBuy={async (selection) => { if (!user) return navigate('/login'); await addItem(selection.id); navigate('/checkout'); }} />)}</div></div>}
    </section>
  );
}
