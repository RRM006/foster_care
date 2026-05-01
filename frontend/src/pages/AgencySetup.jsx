import { useState } from 'react';
import { Building2, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { agencySetup } from '../api/api';

function AgencySetup({ user, onSetupComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: user?.email || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await agencySetup.complete(formData);
      // Notify parent that setup is done
      onSetupComplete(formData.name);
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={32} color="#111111" aria-hidden="true" />
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111111' }}>Agency Setup</h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
            Welcome! Please fill in your foster care center details to get started.
            This information will be visible to staff and donors in your center.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="setup-name">
              <Building2 size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Foster Care Center Name *
            </label>
            <input
              id="setup-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g., Dhaka Child Welfare Center"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="setup-address">
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Address
            </label>
            <input
              id="setup-address"
              type="text"
              name="address"
              className="form-input"
              placeholder="e.g., 42 Mirpur Road, Dhaka 1207"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="setup-phone">
              <Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Contact Number
            </label>
            <input
              id="setup-phone"
              type="tel"
              name="phone"
              className="form-input"
              placeholder="e.g., 01718964936"
              value={formData.phone}
              onChange={handleChange}
              maxLength={11}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="setup-email">
              <Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Agency Email
            </label>
            <input
              id="setup-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="agency@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? 'Setting up...' : (
              <>
                Complete Setup
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgencySetup;
