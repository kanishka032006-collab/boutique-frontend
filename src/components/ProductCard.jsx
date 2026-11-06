import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onAdd, onBuy, showDetailsButton = false }) {
  const { user } = useAuth();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const saved = wishlist?.has(product.id) || false;
  const toggleWishlist = async () => {
    if (!user) { navigate('/login', { state: { from: `/products/${product.slug}` } }); return; }
    try {
      const added = await wishlist.toggle(product);
      setFeedback(added ? 'Added to your wishlist.' : 'Removed from your wishlist.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Wishlist could not be updated.');
    }
  };
  const buyNow = () => {
    if (!user) {
      navigate('/register', { state: { pendingProductId: product.id, continueTo: '/checkout' } });
      return;
    }
    onBuy ? onBuy(product) : onAdd(product);
  };
  const addToCart = () => {
    if (!user) {
      navigate('/register', { state: { pendingProductId: product.id, continueTo: '/cart' } });
      return;
    }
    onAdd(product);
  };
  const image = product.image_url || product.images?.[0]?.url;
  const imageUrl = image && (image.startsWith('http') ? image : `${import.meta.env.VITE_API_ORIGIN || ''}${image}`);
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-image-placeholder"><span>V</span><small>VEDHIKA BRAND</small></div>
        )}
        {product.is_customizable && <span className="product-tag">Personalizable</span>}
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">{product.category_name || 'VEDHIKA BRAND COLLECTION'}</p>
        <Link to={`/products/${product.slug}`} className="product-title">{product.name}</Link>
        <p className="product-description">{product.description}</p>
        <div className="product-card-bottom">
          <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
          <span className={`stock-label ${product.stock < 1 ? 'stock-empty' : ''}`}>{product.stock > 0 ? `${product.stock} available` : 'Sold out'}</span>
          <button className={`icon-button wishlist-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={saved} onClick={toggleWishlist}>
            <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} />
          </button>
        </div>
        {feedback && <span className="product-feedback" role="status">{feedback}</span>}
        <div className="product-actions">
          {showDetailsButton && <Link className="button button-outline product-details-button" to={`/products/${product.slug}`}>View Details</Link>}
          <button className="button button-outline" onClick={addToCart} disabled={product.stock < 1}>Add to Cart</button>
          <button className="button button-gold" onClick={buyNow} disabled={product.stock < 1}>Buy Now</button>
        </div>
      </div>
    </article>
  );
}
