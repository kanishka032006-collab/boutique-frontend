import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

function useAdminData(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try { setData((await api.get(path)).data); setError(''); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, [path]);
  return { data, error, loading, reload, setError };
}

function AdminFeedback({ error, notice }) {
  return <>{error && <div className="alert alert-danger">{error}</div>}{notice && <div className="alert alert-success">{notice}</div>}</>;
}

export function AdminOverviewPage() {
  const { data, error, loading } = useAdminData('/admin/overview');
  if (loading || !data) return <><AdminFeedback error={error} /><p className="loading-copy">Gathering your studio's latest...</p></>;
  return <><AdminFeedback error={error} /><div className="metric-grid">{[
    ['Total sales', `₹${Number(data.metrics.total_sales).toLocaleString('en-IN')}`, 'bi-currency-rupee'],
    ['All orders', data.metrics.total_orders, 'bi-receipt'],
    ['Customers', data.metrics.total_customers, 'bi-people'],
    ['Active products', data.metrics.active_products, 'bi-box-seam'],
    ['Pending orders', data.metrics.open_orders, 'bi-hourglass-split'],
    ['New quote inquiries', data.metrics.new_inquiries, 'bi-envelope-paper']
  ].map(([label, value, icon]) => <div className="metric-card" key={label}><span className="metric-icon"><i className={`bi ${icon}`} /></span><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="admin-section-card"><div className="admin-card-heading"><div><p className="eyebrow">FRESH FROM THE STUDIO</p><h3>Recent orders</h3></div><a href="/admin/orders" className="text-link">All orders →</a></div>
      {data.recentOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{data.recentOrders.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.customer_name}<small>{order.customer_email}</small></td><td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td><td><span className={`status-pill status-${order.status}`}>{order.status}</span></td><td>₹{Number(order.subtotal).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div> : <div className="admin-empty">Your first order will appear here.</div>}
    </div><div className="admin-notice"><i className="bi bi-info-circle" /><span><strong>{data.metrics.low_stock} products</strong> have five or fewer items in stock, and <strong>{data.metrics.open_orders} orders</strong> need attention.</span></div>
  </>;
}

const emptyProduct = { name: '', categoryId: '', description: '', price: '', stock: '0', isCustomizable: false, isActive: true };

export function AdminProductsPage() {
  const { data, error, loading, reload, setError } = useAdminData('/admin/products');
  const categoryState = useAdminData('/admin/categories');
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const products = data?.products || [];
  const categories = categoryState.data?.categories || [];
  const edit = (product) => {
    setEditing(product.id);
    setFormOpen(true);
    setForm({ name: product.name, categoryId: product.category_id || '', description: product.description, price: product.price, stock: product.stock, isCustomizable: product.is_customizable, isActive: product.is_active });
    setFiles([]);
    setExistingImages(product.images || []);
    setNotice('');
  };
  const reset = () => { setForm(emptyProduct); setEditing(null); setFiles([]); setExistingImages([]); setFormOpen(false); };
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const payload = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : null, price: Number(form.price), stock: Number(form.stock) };
      const response = editing ? await api.patch(`/admin/products/${editing}`, payload) : await api.post('/admin/products', payload);
      const product = response.data.product;
      if (files.length) {
        const upload = new FormData();
        Array.from(files).slice(0, 5).forEach((file) => upload.append('images', file));
        await api.post(`/admin/products/${product.id}/images`, upload);
      }
      setNotice(editing ? 'Product changes saved.' : 'Product added to your collection.');
      reset(); await reload();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const removeImage = async (image) => {
    if (!editing || !window.confirm('Delete this product image? This cannot be undone.')) return;
    setDeletingImageId(image.id); setError(''); setNotice('');
    try {
      const { data: response } = await api.delete(`/admin/products/${editing}/images/${image.id}`);
      setExistingImages(response.images);
      setError(response.warning || '');
      setNotice('Product image deleted.');
      await reload();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setDeletingImageId(null); }
  };
  const remove = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the storefront?`)) return;
    setError(''); setNotice('');
    try { await api.delete(`/admin/products/${product.id}`); setNotice('Product removed from the storefront.'); await reload(); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  return <><div className="admin-page-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h1>Products</h1></div><div className="admin-product-heading-actions"><span>{products.length} total</span><button type="button" className="button button-dark" aria-expanded={formOpen} aria-controls="admin-product-form" onClick={() => { if (formOpen) reset(); else setFormOpen(true); }}>{formOpen ? 'Close form' : 'Add product'} <i className={`bi ${formOpen ? 'bi-x-lg' : 'bi-plus-lg'}`} /></button></div></div><AdminFeedback error={error || categoryState.error} notice={notice} />
    {formOpen && <form id="admin-product-form" className="admin-form-card" onSubmit={submit}><div className="admin-card-heading"><h3>{editing ? 'Edit this keepsake' : 'Add something lovely'}</h3>{editing && <button type="button" className="text-button" onClick={reset}>Cancel edit</button>}</div>
      <div className="admin-product-form"><label>Product name<input required minLength="2" maxLength="180" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Occasion<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Choose category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Available stock<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label><label className="admin-form-span">Description<textarea required minLength="10" maxLength="5000" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>{editing && existingImages.length > 0 && <div className="admin-form-span"><span className="admin-image-label">Current product images</span><div className="admin-image-list">{existingImages.map((image) => <div className="admin-image-item" key={image.id}><img src={image.url} alt={image.alt_text || form.name} /><button type="button" className="danger-link" disabled={deletingImageId === image.id} onClick={() => removeImage(image)}>{deletingImageId === image.id ? 'Deleting…' : 'Delete image'} <i className="bi bi-trash" /></button></div>)}</div></div>}<label className="admin-form-span">Product images <span className="optional">(up to 5, max 5 MB each)</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => setFiles(e.target.files)} /></label><label className="admin-check"><input type="checkbox" checked={form.isCustomizable} onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })} /> Supports printed names / gift messages</label>{editing && <label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible in the storefront</label>}</div>
      <button className="button button-dark" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add product'} <i className="bi bi-arrow-right" /></button>
    </form>}
    <div className="admin-section-card"><div className="admin-card-heading"><h3>All products</h3></div>{loading ? <p className="loading-copy">Loading products...</p> : products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Occasion</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}{product.is_customizable && <small>Personalizable</small>}</td><td>{product.category_name || '—'}</td><td>₹{Number(product.price).toLocaleString('en-IN')}</td><td>{product.stock}</td><td><span className={`status-pill ${product.is_active ? 'status-delivered' : 'status-cancelled'}`}>{product.is_active ? 'Active' : 'Hidden'}</span></td><td className="table-actions"><button onClick={() => edit(product)}>Edit</button><button className="danger-link" onClick={() => remove(product)}>Remove</button></td></tr>)}</tbody></table></div> : <div className="admin-empty">No products yet. Add your first keepsake above.</div>}</div>
  </>;
}

export function AdminOrdersPage() {
  const { data, error, loading, reload, setError } = useAdminData('/admin/orders');
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState(null);
  const updateStatus = async (id, status) => {
    setError(''); setNotice('');
    try { await api.patch(`/admin/orders/${id}/status`, { status }); setNotice(`Order #${id} updated.`); await reload(); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  return <><div className="admin-page-heading"><div><p className="eyebrow">FROM CHECKOUT TO THEIR DOOR</p><h1>Orders</h1></div><span>{data?.orders.length || 0} orders</span></div><AdminFeedback error={error} notice={notice} /><div className="admin-section-card">{loading ? <p className="loading-copy">Loading orders...</p> : data?.orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Total</th><th>Payment</th><th>Status</th><th>Details</th></tr></thead><tbody>{data.orders.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.customer_name}<small>{order.customer_email}<br />{order.customer_phone}</small></td><td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td><td>₹{Number(order.subtotal).toLocaleString('en-IN')}</td><td>{order.payment_method === 'cash_on_delivery' ? 'Cash on delivery' : order.payment_method}<small>{order.payment_status}</small></td><td><select className="status-select" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>{['pending','confirmed','processing','shipped','delivered','cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><button className="text-button" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>{expanded === order.id ? 'Hide' : 'View'}</button>{expanded === order.id && <div className="order-detail-pop"><strong>Deliver to</strong><p>{order.shipping_address.fullName}<br />{order.shipping_address.addressLine1}<br />{order.shipping_address.addressLine2}<br />{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}<br />{order.shipping_address.country}<br />{order.shipping_address.phone}</p><strong>Items</strong>{order.items.map((item, index) => <p key={index}>{item.name} × {item.quantity}{item.printedName && ` · ${item.printedName}`}{item.giftMessage && ` · “${item.giftMessage}”`}</p>)}{order.notes && <p><strong>Note:</strong> {order.notes}</p>}</div>}</td></tr>)}</tbody></table></div> : <div className="admin-empty">Your orders will appear here.</div>}</div></>;
}

export function AdminCustomersPage() {
  const { data, error, loading } = useAdminData('/admin/customers');
  return <><div className="admin-page-heading"><div><p className="eyebrow">THE PEOPLE BEHIND THE PARTIES</p><h1>Customers</h1></div><span>{data?.customers.length || 0} lovely people</span></div><AdminFeedback error={error} />{loading ? <p className="loading-copy">Loading customers...</p> : <div className="admin-section-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>{data?.customers.map((customer) => <tr key={customer.id}><td>{customer.name}<small>{customer.email}</small></td><td>{customer.phone || '—'}</td><td>{new Date(customer.created_at).toLocaleDateString('en-IN')}</td><td>{customer.order_count}</td><td>₹{Number(customer.total_spent).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div></div>}</>;
}

export function AdminMessagesPage() {
  const { data, error, loading } = useAdminData('/admin/messages');
  return <><div className="admin-page-heading"><div><p className="eyebrow">NOTES FROM YOUR COMMUNITY</p><h1>Messages</h1></div><span>{data?.messages.length || 0} messages</span></div><AdminFeedback error={error} />{loading ? <p className="loading-copy">Gathering your messages...</p> : data?.messages.length ? <div className="message-list">{data.messages.map((message) => <article className="message-card" key={message.id}><div><div><h3>{message.name}</h3><a href={`mailto:${message.email}`}>{message.email}</a>{message.phone && <p>{message.phone}</p>}</div><time>{new Date(message.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time></div><p>{message.message}</p><a className="text-link" href={`mailto:${message.email}?subject=${encodeURIComponent('VEDHIKA BRAND enquiry')}`}>Reply by email <i className="bi bi-arrow-up-right" /></a></article>)}</div> : <div className="admin-section-card admin-empty">New contact form messages will appear here.</div>}</>;
}

export function AdminQuotationsPage() {
  const { data, error, loading, reload, setError } = useAdminData('/admin/quotations');
  const [notice, setNotice] = useState('');
  const updateStatus = async (id, status) => {
    setError('');
    setNotice('');
    try {
      await api.patch(`/admin/quotations/${id}/status`, { status });
      setNotice(`Inquiry #${id} updated.`);
      await reload();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };
  return <><div className="admin-page-heading"><div><p className="eyebrow">BESPOKE EVENTS & BULK ORDERS</p><h1>Quote inquiries</h1></div><span>{data?.quotations.length || 0} inquiries</span></div><AdminFeedback error={error} notice={notice} />{loading ? <p className="loading-copy">Gathering quote inquiries...</p> : data?.quotations.length ? <div className="message-list">{data.quotations.map((quote) => <article className="message-card quotation-card" key={quote.id}><div><div><h3>{quote.fullName}</h3><a href={`mailto:${quote.email}`}>{quote.email}</a><p>{quote.phone}</p></div><div className="quotation-status"><time>{new Date(quote.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time><select className="status-select" value={quote.status} onChange={(event) => updateStatus(quote.id, event.target.value)} aria-label={`Update inquiry ${quote.id} status`}>{['new', 'contacted', 'quoted', 'closed'].map((status) => <option value={status} key={status}>{status}</option>)}</select></div></div><p><strong>{quote.eventType.replaceAll('_', ' ')} · {quote.estimatedQuantity} guests</strong><br />Budget: {quote.budgetRange || 'Not specified'} · Date: {quote.eventDate || 'Not specified'}<br />Delivery: {quote.deliveryLocation}</p>{quote.additionalDetails && <p>{quote.additionalDetails}</p>}<a className="text-link" href={`mailto:${quote.email}?subject=${encodeURIComponent('VEDHIKA BRAND · your gifting inquiry')}`}>Reply by email <i className="bi bi-arrow-up-right" /></a></article>)}</div> : <div className="admin-section-card admin-empty">New quote inquiries will appear here.</div>}</>;
}

export function AdminCategoriesPage() {
  const { data, error, loading, reload, setError } = useAdminData('/admin/categories');
  const [form, setForm] = useState({ name: '', description: '' });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState({});
  const create = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { await api.post('/admin/categories', form); setForm({ name: '', description: '' }); setNotice('Category added.'); await reload(); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const save = async (id) => {
    setError(''); setNotice('');
    try { await api.patch(`/admin/categories/${id}`, editing[id]); setNotice('Category updated.'); await reload(); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  const remove = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Products in this category will remain in your catalog.`)) return;
    try { await api.delete(`/admin/categories/${category.id}`); setNotice('Category deleted.'); await reload(); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  return <><div className="admin-page-heading"><div><p className="eyebrow">OCCASIONS MADE SPECIAL</p><h1>Categories</h1></div></div><AdminFeedback error={error} notice={notice} /><form className="admin-form-card category-create" onSubmit={create}><h3>Add a category</h3><div className="category-form-row"><label>Category name<input required minLength="2" maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Description<input maxLength="1000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><button className="button button-dark" disabled={busy}>Add category</button></div></form><div className="admin-section-card"><h3>Manage occasions</h3>{loading ? <p className="loading-copy">Loading categories...</p> : (data?.categories || []).map((category) => <div className="category-admin-row" key={category.id}><label>Name<input value={editing[category.id]?.name ?? category.name} onChange={(e) => setEditing({ ...editing, [category.id]: { ...editing[category.id], name: e.target.value } })} /></label><label>Description<input value={editing[category.id]?.description ?? category.description ?? ''} onChange={(e) => setEditing({ ...editing, [category.id]: { ...editing[category.id], description: e.target.value } })} /></label><span>{category.product_count} products</span><button className="text-button" onClick={() => save(category.id)}>Save</button><button className="text-button danger-link" onClick={() => remove(category)}>Delete</button></div>)}</div></>;
}

export function AdminDeliveryChargeSettingsPage() {
  const { data, error, loading, reload, setError } = useAdminData('/admin/delivery-charge-settings');
  const [enabled, setEnabled] = useState(false);
  const [ratePerKm, setRatePerKm] = useState('1.00');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setRatePerKm(data.rate_per_km);
  }, [data]);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      await api.put('/admin/delivery-charge-settings', { enabled, rate_per_km: ratePerKm });
      setNotice('Delivery charge settings saved.');
      await reload();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  };

  return <><div className="admin-page-heading"><div><p className="eyebrow">CHECKOUT CONFIGURATION</p><h1>Delivery Charge Settings</h1></div></div><AdminFeedback error={error} notice={notice} />
    {loading ? <p className="loading-copy">Loading delivery settings...</p> : <form className="admin-form-card" onSubmit={save}>
      <p className="admin-help-copy">Distance provider: {data?.distance_provider || 'Checking availability…'}. Delivery addresses are used only to calculate a driving route.</p>
      <label className="admin-check"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Enable distance-based COD charges</label>
      <label>Delivery charge per kilometre (₹)<input required type="number" min="0" max="999999.99" step="0.01" value={ratePerKm} onChange={(event) => setRatePerKm(event.target.value)} /></label>
      <p className="admin-help-copy">Example: at ₹{Number(ratePerKm || 0).toFixed(2)} per KM, a 15 KM delivery adds ₹{(15 * Number(ratePerKm || 0)).toFixed(2)} to the COD order.</p>
      <button className="button button-dark" disabled={busy}>{busy ? 'Saving settings...' : 'Save Settings'}</button>
    </form>}
  </>;
}

export function AdminReportsPage() {
  const { data, error, loading } = useAdminData('/admin/reports/sales');
  const [dates, setDates] = useState({ from: '', to: '' });
  const [notice, setNotice] = useState('');
  const [report, setReport] = useState(null);
  const [requestError, setRequestError] = useState('');
  const [busy, setBusy] = useState('');
  const loadSales = async () => {
    setBusy('sales'); setRequestError(''); setNotice('');
    try { const { data: result } = await api.get('/admin/reports/sales', { params: dates }); setReport(result.report); }
    catch (e) { setRequestError(getErrorMessage(e)); }
    finally { setBusy(''); }
  };
  const download = async (path, filename) => {
    setBusy(filename); setRequestError(''); setNotice('');
    try {
      const { data: blob } = await api.get(path, { params: path.includes('/sales.pdf') ? dates : undefined, responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setNotice(`${filename} downloaded.`);
    } catch (e) { setRequestError(getErrorMessage(e)); }
    finally { setBusy(''); }
  };
  if (loading || !data) return <><div className="admin-page-heading"><div><p className="eyebrow">A CLEAR LOOK AT THE BIG PICTURE</p><h1>Reports</h1></div></div><AdminFeedback error={error || requestError} notice={notice} /><p className="loading-copy">{loading ? 'Preparing reports...' : 'Sales report is unavailable.'}</p></>;
  return <><div className="admin-page-heading"><div><p className="eyebrow">A CLEAR LOOK AT THE BIG PICTURE</p><h1>Reports</h1></div></div><AdminFeedback error={error || requestError} notice={notice} /><div className="report-date-filter"><label>From<input type="date" value={dates.from} onChange={(e) => setDates({ ...dates, from: e.target.value })} /></label><label>To<input type="date" value={dates.to} onChange={(e) => setDates({ ...dates, to: e.target.value })} /></label><button className="button button-dark" onClick={loadSales} disabled={Boolean(busy)}>Update report</button></div>{loading ? <p className="loading-copy">Preparing reports...</p> : <div className="metric-grid report-metrics">{[['Sales', `₹${Number(report?.sales ?? data?.report.sales).toLocaleString('en-IN')}`, 'bi-currency-rupee'], ['Orders', report?.order_count ?? data?.report.order_count, 'bi-receipt'], ['Average order value', `₹${Number(report?.average_order_value ?? data?.report.average_order_value).toLocaleString('en-IN')}`, 'bi-graph-up']].map(([label, value, icon]) => <div className="metric-card" key={label}><span className="metric-icon"><i className={`bi ${icon}`} /></span><span>{label}</span><strong>{value}</strong></div>)}  </div>}<div className="admin-section-card"><div className="admin-card-heading"><div><p className="eyebrow">TAKE IT WITH YOU</p><h3>Download a report</h3></div></div><div className="download-grid"><button onClick={() => download('/admin/reports/orders.xlsx', 'vedhika-orders.xlsx')} disabled={Boolean(busy)}><i className="bi bi-file-earmark-spreadsheet" /><span><strong>Order details</strong><small>Excel workbook · all orders</small></span><i className="bi bi-download" /></button><button onClick={() => download('/admin/reports/orders.pdf', 'vedhika-orders.pdf')} disabled={Boolean(busy)}><i className="bi bi-file-earmark-pdf" /><span><strong>Order details</strong><small>PDF report · all orders</small></span><i className="bi bi-download" /></button><button onClick={() => download('/admin/reports/customers.xlsx', 'vedhika-customers.xlsx')} disabled={Boolean(busy)}><i className="bi bi-people" /><span><strong>Customer details</strong><small>Excel workbook · all customers</small></span><i className="bi bi-download" /></button><button onClick={() => download('/admin/reports/customers.pdf', 'vedhika-customers.pdf')} disabled={Boolean(busy)}><i className="bi bi-file-earmark-pdf" /><span><strong>Customer details</strong><small>PDF report · all customers</small></span><i className="bi bi-download" /></button><button onClick={() => download('/admin/reports/sales.pdf', 'vedhika-sales-report.pdf')} disabled={Boolean(busy)}><i className="bi bi-file-earmark-pdf" /><span><strong>Sales summary</strong><small>PDF report · selected dates</small></span><i className="bi bi-download" /></button></div></div></>;
}
