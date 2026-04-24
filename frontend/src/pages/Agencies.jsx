import { useState, useEffect } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { agencies } from '../api/api';
import Modal from '../components/Modal';

function AgenciesPage({ user }) {
  const [agenciesList, setAgenciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      const response = await agencies.getAll();
      setAgenciesList(response.data.agencies || []);
    } catch (err) {
      console.error('Failed to load agencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await agencies.create(formData);
      loadAgencies();
      setShowModal(false);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredAgencies = agenciesList.filter(agency =>
    agency.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading agencies...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Agencies</h1>
        {(isAdmin || isStaff) && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} aria-hidden="true" /> Add Agency
            </button>
          </div>
        )}
      </div>

      <div className="search-bar">
        <div className="search-input" style={{ position: 'relative' }}>
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search agencies by name"
          />
        </div>
      </div>

      {filteredAgencies.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} aria-hidden="true" />
          <p>No agencies found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredAgencies.map((agency) => (
            <div key={agency._id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: '#E8F8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={20} color="#228B22" aria-hidden="true" />
                </div>
                <h3>{agency.name}</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{agency.address || '-'}</p>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {agency.phone && <p>📞 {agency.phone}</p>}
                {agency.email && <p>✉️ {agency.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Agency">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="agency-name">Agency Name *</label>
              <input
                id="agency-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agency-address">Address</label>
              <textarea
                id="agency-address"
                className="form-textarea"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agency-phone">Phone</label>
              <input
                id="agency-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agency-email">Email</label>
              <input
                id="agency-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AgenciesPage;