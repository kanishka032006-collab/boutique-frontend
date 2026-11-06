import { useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  eventType: '',
  estimatedQuantity: '',
  budgetRange: '',
  eventDate: '',
  deliveryLocation: '',
  additionalDetails: '',
};

const eventTypes = [
  ['wedding', 'Wedding'],
  ['birthday', 'Birthday'],
  ['anniversary', 'Anniversary'],
  ['corporate_event', 'Corporate Event'],
  ['festival', 'Festival'],
  ['other', 'Other'],
];

const quantities = [
  ['10-50', '10–50'],
  ['50-100', '50–100'],
  ['100-250', '100–250'],
  ['250-500', '250–500'],
  ['500+', '500+'],
];

export default function QuoteForm({ compact = false }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const { data } = await api.post('/quotations', form);
      setSuccess(data.message);
      setForm(initialForm);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const dateMinimum = new Date().toLocaleDateString('en-CA');

  return (
    <form className={`quote-form ${compact ? 'quote-form-compact' : ''}`} onSubmit={submit}>
      {!compact && <div className="quote-form-heading"><p className="eyebrow">YOUR OCCASION, CONSIDERED</p><h2>Tell us what you’re celebrating.</h2><p>Share a few details. Our gifting team will follow up to discuss a considered quote.</p></div>}
      {error && <div className="form-feedback form-error" role="alert">{error}</div>}
      {success && <div className="form-feedback form-success" role="status">{success}</div>}
      <div className="quote-fields">
        <label>Full Name<input required minLength="2" maxLength="120" autoComplete="name" value={form.fullName} onChange={update('fullName')} /></label>
        <label>Email Address<input required type="email" autoComplete="email" value={form.email} onChange={update('email')} /></label>
        <label>Phone Number<input required type="tel" minLength="7" maxLength="30" autoComplete="tel" value={form.phone} onChange={update('phone')} /></label>
        <label>Event Type<select required value={form.eventType} onChange={update('eventType')}><option value="">Select an occasion</option>{eventTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Estimated Quantity<select required value={form.estimatedQuantity} onChange={update('estimatedQuantity')}><option value="">Select quantity</option>{quantities.map(([value, label]) => <option key={value} value={value}>{label} guests</option>)}</select></label>
        <label>Budget Range<input required minLength="2" maxLength="120" placeholder="e.g. ₹2,000–₹4,000 per guest" value={form.budgetRange} onChange={update('budgetRange')} /></label>
        <label>Event Date<input required type="date" min={dateMinimum} value={form.eventDate} onChange={update('eventDate')} /></label>
        <label>Delivery Location<input required minLength="2" maxLength="250" autoComplete="shipping address-level2" placeholder="City, venue or delivery address" value={form.deliveryLocation} onChange={update('deliveryLocation')} /></label>
        <label className="quote-full">Additional Details <span className="optional">(optional)</span><textarea rows="4" maxLength="3000" placeholder="Preferred products, packaging, event theme, personalisation..." value={form.additionalDetails} onChange={update('additionalDetails')} /></label>
      </div>
      <button className="button button-gold quote-submit" type="submit" disabled={busy}>{busy ? 'Submitting inquiry…' : 'SUBMIT INQUIRY'} <i className="bi bi-arrow-up-right" /></button>
    </form>
  );
}
