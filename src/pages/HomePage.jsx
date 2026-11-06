import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categoriesForNavigation = {
  'Wedding Return Gifts': 'wedding-return-gifts',
  'Birthday Return Gifts': 'birthday-return-gifts',
  'Baby Shower Return Gifts': 'baby-shower-return-gifts',
  'Housewarming Return Gifts': 'housewarming-return-gifts',
  'Traditional Return Gifts': 'traditional-return-gifts',
  'Customized Return Gifts': 'customized-return-gifts',
};

const experienceSteps = [
  ['bi-chat-heart', 'CONSULTATION', 'Discuss your event theme, guest list, and vision with our dedicated gifting concierge.'],
  ['bi-stars', 'CUSTOMIZATION', 'Select products, bespoke packaging, ribbons and personalized name tags or logos.'],
  ['bi-flower1', 'CURATION', 'Our artisans carefully prepare and arrange every gift.'],
  ['bi-box-seam', 'DELIVERY', 'Relax as we handle the logistics, ensuring pristine, on-time delivery to your venue.'],
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/products?limit=6&sort=newest'), api.get('/categories')])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.data.products);
        setCategories(categoryResponse.data.categories);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  const add = async (product) => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); } catch (requestError) { setError(getErrorMessage(requestError)); }
  };

  const buy = async (product) => {
    if (!user) { navigate('/login'); return; }
    try { await addItem(product.id); navigate('/checkout'); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">BESPOKE RETURN GIFTS</span>
          <h1>Curated Elegance<br /><em>For Every Guest</em></h1>
          <p>Elevate your milestones—weddings, corporate retreats, and grand celebrations—with bespoke return gifts crafted by master artisans.</p>
          <div className="hero-buttons"><Link to="/return-gifts" className="button button-gold">EXPLORE RETURN GIFTS <i className="bi bi-arrow-up-right" /></Link><Link to="/quote" className="button button-outline">INQUIRE NOW <i className="bi bi-arrow-right" /></Link></div>
          <div className="hero-caption">VEDHIKA BRAND <span>·</span> BOUTIQUE RETURN GIFTS</div>
        </div>
        <div className="hero-mark"><span>V</span><i>✦</i></div>
      </section>

      <section className="brand-intro"><span className="gold-rule" /><p>Elegance in Every Gift, Luxury in Every Detail.</p><span className="gold-rule" /></section>

      <section className="section featured-section">
        <div className="section-heading"><div><p className="eyebrow">VEDHIKA BRAND · RETURN GIFTS</p><h2>Considered gifts. <em>Lasting impressions.</em></h2></div><Link to="/return-gifts" className="text-link">VIEW RETURN GIFTS <span>→</span></Link></div>
        {error && <div className="alert alert-danger">{error}</div>}
        {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={add} onBuy={buy} />)}</div> : <div className="empty-collection"><span>V</span><h3>The VEDHIKA collection is being curated.</h3><p>Visit again soon or tell us what you’re celebrating.</p><Link to="/quote" className="button button-gold">REQUEST A QUOTE</Link></div>}
      </section>

      <section className="collections-section">
        <div className="collections-heading">
          <p className="eyebrow">A GIFT FOR EVERY MILESTONE</p>
          <h2>Find something <em>meaningful.</em></h2>
          <p>Thoughtful keepsakes, beautifully chosen for the moments worth celebrating.</p>
        </div>
        <div className="collections-band">
          {categories.filter((category) => categoriesForNavigation[category.name]).map((category, index) => <Link key={category.id} className={`collection-feature collection-feature-${index + 1}`} to={`/products?category=${category.slug}`}><span className="eyebrow">{category.name.toUpperCase()}</span><strong>{category.name}</strong><span>EXPLORE COLLECTION <i className="bi bi-arrow-up-right" /></span></Link>)}
        </div>
      </section>

      <section className="section experience-section">
        <div className="section-heading"><div><p className="eyebrow">THE VEDHIKA EXPERIENCE</p><h2>Thoughtfully curated, <em>beautifully delivered.</em></h2></div></div>
        <div className="experience-grid">{experienceSteps.map(([icon, title, copy], index) => <article className="experience-step" key={title}><span className="experience-icon"><i className={`bi ${icon}`} /></span><span className="experience-number">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

    </>
  );
}
