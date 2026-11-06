import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { contactInfo } from '../constants/contact';

export function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <p className="eyebrow">THE STORY OF VEDHIKA BRAND</p>
        <h1>Rooted in heritage.<br /><em>Made for your moments.</em></h1>
        <p>Curating the enduring beauty of Indian craftsmanship for life's grandest celebrations.</p>
      </div>
      <div className="about-story">
        <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1100&q=85" alt="Traditional Indian silk and handloom craftsmanship" />
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h2>Tradition, thoughtfully treasured.</h2>
          <p>VEDHIKA BRAND is a luxury digital boutique curating authentic handloom Kanchipuram sarees, pure heritage silks, and bespoke return gifts for life's grandest celebrations.</p>
          <p>We bring the artistry of Indian makers into meaningful moments, pairing considered collections with personal service for every guest, host and occasion.</p>
          <Link to="/products" className="button button-gold">EXPLORE OUR COLLECTIONS <i className="bi bi-arrow-up-right" /></Link>
        </div>
      </div>
      <div className="values-grid">
        <div><span>01</span><h3>Our Craftsmanship</h3><p>We celebrate the skill, patience and detail woven into every heritage textile and artisan-made keepsake.</p></div>
        <div><span>02</span><h3>Our Collections</h3><p>From Kanchipuram silk to bespoke wedding and corporate gifting, each collection is selected with intention.</p></div>
        <div><span>03</span><h3>Our Commitment</h3><p>Personal curation, thoughtful presentation and care at every step—from first conversation to delivery.</p></div>
      </div>
    </section>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const { data } = await api.post('/contact', form);
      setSuccess(data.message); setForm({ name: '', email: '', phone: '', message: '' });
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  return (
    <section className="section contact-page">
      <div className="contact-intro">
        <p className="eyebrow">PERSONAL SERVICE, ALWAYS</p>
        <h1>Let’s talk about<br /><em>your occasion.</em></h1>
        <p>From a treasured silk to a celebration of hundreds, our team is here to help you curate something distinctive.</p>
        <div className="contact-details">
          <article className="contact-detail-card">
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <div>
              <span>BOUTIQUE ADDRESS</span>
              <strong>{contactInfo.address}</strong>
              <a href={contactInfo.directionsUrl} target="_blank" rel="noreferrer">Get directions <i className="bi bi-arrow-right" /></a>
            </div>
          </article>
          <article className="contact-detail-card">
            <i className="bi bi-telephone" aria-hidden="true" />
            <div>
              <span>CONCIERGE</span>
              {contactInfo.phones.map((phone) => <a className="contact-phone" href={`tel:${phone.tel}`} key={phone.tel}>{phone.display}</a>)}
              <a href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer">Chat on WhatsApp <i className="bi bi-whatsapp" /></a>
            </div>
          </article>
          <article className="contact-detail-card">
            <i className="bi bi-envelope" aria-hidden="true" />
            <div>
              <span>WRITE TO US</span>
              <a className="contact-phone" href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </div>
          </article>
          <article className="contact-detail-card">
            <i className="bi bi-clock" aria-hidden="true" />
            <div>
              <span>BOUTIQUE HOURS</span>
              {contactInfo.hours.map((hours) => <strong key={hours}>{hours}</strong>)}
            </div>
          </article>
        </div>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <h2>Send us an inquiry</h2><p>Your note goes directly to the VEDHIKA BRAND team.</p>
        {error && <div className="alert alert-danger">{error}</div>}{success && <div className="alert alert-success">{success}</div>}
        <label>Your name<input required minLength="2" maxLength="120" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Phone number <span className="optional">(optional)</span><input type="tel" maxLength="30" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label>How may we assist you?<textarea required minLength="10" maxLength="3000" rows="5" placeholder="Tell us about your collection or celebration..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
        <button className="button button-gold" disabled={busy}>{busy ? 'SENDING…' : 'SEND INQUIRY'} <i className="bi bi-arrow-up-right" /></button>
      </form>
    </section>
  );
}

const policyCopy = {
  shipping: {
    title: 'Shipping & Delivery',
    copy: 'Delivery timelines and charges depend on your destination, selected collection and event requirements. Please confirm the current estimate with VEDHIKA BRAND before placing an order.',
  },
  returns: {
    title: 'Returns & Exchanges',
    copy: 'Return and exchange eligibility can vary for handloom, personalized and made-to-order pieces. Contact VEDHIKA BRAND for the current terms applicable to your item before purchase.',
  },
  privacy: {
    title: 'Privacy Policy',
    copy: 'VEDHIKA BRAND uses account and order details to manage customer service and fulfil purchases. Contact us for the full privacy policy and data-retention details before launch.',
  },
  terms: {
    title: 'Terms of Service',
    copy: 'Product availability, customization, delivery and payment terms are confirmed with each order. Contact VEDHIKA BRAND for the complete terms before purchasing.',
  },
};

export function PolicyPage({ type }) {
  const policy = policyCopy[type] || policyCopy.terms;
  return <section className="section policy-page"><p className="eyebrow">VEDHIKA BRAND · CUSTOMER CARE</p><h1>{policy.title}</h1><p>{policy.copy}</p><Link className="button button-outline" to="/contact">CONTACT VEDHIKA BRAND</Link></section>;
}
