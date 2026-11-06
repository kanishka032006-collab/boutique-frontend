import QuoteForm from '../components/QuoteForm';

export default function QuotePage() {
  return (
    <section className="section quote-page">
      <div className="quote-page-intro">
        <p className="eyebrow">BULK &amp; CORPORATE GIFTING</p>
        <h1>Curated elegance<br /><em>for every guest.</em></h1>
        <p>Share your occasion, guest count and vision. VEDHIKA BRAND will help you create a considered gifting experience.</p>
      </div>
      <QuoteForm />
    </section>
  );
}
