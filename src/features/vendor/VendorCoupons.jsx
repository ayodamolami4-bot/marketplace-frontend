import { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import './vendor.css';

export default function VendorCoupons() {
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', discountPercent: '', expiresAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function loadCoupons() {
    setLoading(true); setCheckedAt(Date.now());
    try { const response = await apiRequest('/vendor/coupons'); setCoupons(response?.data || []); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadCoupons(); }, []);
  async function createCoupon(event) {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const percentage = Number(form.discountPercent);
    const expiry = new Date(form.expiresAt);
    if (!/^[A-Z0-9][A-Z0-9_-]{1,49}$/.test(code)) { setError('Use a code of 2 to 50 letters, digits, hyphens or underscores.'); return; }
    if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) { setError('Discount must be a whole number from 1 to 100.'); return; }
    if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) { setError('Expiry must be in the future.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const created = await apiRequest('/vendor/coupons', { method: 'POST', body: JSON.stringify({ code, discountPercent: percentage, expiresAt: expiry.toISOString() }) });
      setCheckedAt(Date.now()); setCoupons(current => [created, ...current]); setForm({ code: '', discountPercent: '', expiresAt: '' }); setMessage('Coupon created.');
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  }
  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  return <div className="vendor-page">
    <div className="vendor-page-heading"><div><p className="eyebrow">PROMOTIONS</p><h1>Coupons</h1><p>Create discount codes for your store.</p></div></div>
    {error && <div className="form-error vendor-feedback" role="alert">{error}</div>}
    {message && <p role="status">{message}</p>}
    <section className="vendor-panel"><h2>Create coupon</h2><form onSubmit={createCoupon} className="vendor-form-grid">
      <label>Coupon code<input name="code" value={form.code} onChange={update} required minLength={2} maxLength={50} placeholder="AYO10" /></label>
      <label>Discount (%)<input name="discountPercent" type="number" min="1" max="100" step="1" value={form.discountPercent} onChange={update} required /></label>
      <label>Expiry (your local time)<input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={update} required /></label>
      <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Coupon'}</button>
    </form></section>
    <section className="vendor-panel"><h2>Your coupons</h2>
      {loading ? <p>Loading coupons…</p> : error && !coupons.length ? <button onClick={loadCoupons}>Try again</button> : !coupons.length ? <p>No coupons yet.</p> :
        <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Code</th><th>Discount</th><th>Expires</th><th>Status</th></tr></thead><tbody>{coupons.map(coupon => <tr key={coupon.id}><td>{coupon.code}</td><td>{coupon.discountPercent}%</td><td>{new Date(coupon.expiresAt).toLocaleString()}</td><td>{new Date(coupon.expiresAt).getTime() <= checkedAt ? 'Expired' : 'Active'}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
