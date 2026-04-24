import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { donors } from '../api/api';
import Modal from '../components/Modal';

function DonorsPage({ user }) {
  const [donorsList, setDonorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDonor, setEditingDonor] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    donor_type: 'individual',
    password: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      const response = await donors.getAll();
      setDonorsList(response.data.donors || []);
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingDonor) {
        const { password, ...updateData } = formData;
        await donors.update(editingDonor._id, password ? formData : updateData);
      } else {
        await donors.create(formData);
      }
      loadDonors();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    
    try {
      await donors.delete(id);
      loadDonors();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const openEdit = (donor) => {
    setEditingDonor(donor);
    setFormData({
      full_name: donor.full_name || '',
      email: donor.email || '',
      phone: donor.phone || '',
      donor_type: donor.donor_type || 'individual',
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDonor(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      donor_type: 'individual',
      password: ''
    });
    setError('');
  };

  const filteredDonors = donorsList.filter(donor =>
    donor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading donors...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Donors</h1>
        {(isAdmin || isStaff) && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={18} aria-hidden="true" /> Add Donor
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
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search donors by name or email"
          />
        </div>
      </div>

      {filteredDonors.length === 0 ? (
        <div className="empty-state">
          <p>No donors found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Phone</th>
                {(isAdmin || isStaff) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor._id}>
                  <td><strong>{donor.full_name}</strong></td>
                  <td>{donor.email}</td>
                  <td>{donor.donor_type || 'individual'}</td>
                  <td>{donor.phone || '-'}</td>
                  {(isAdmin || isStaff) && (
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(donor)} aria-label={`Edit ${donor.full_name}`}>
                          <Edit size={14} aria-hidden="true" />
                        </button>
                        {isAdmin && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(donor._id)} aria-label={`Delete ${donor.full_name}`}>
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDonor ? 'Edit Donor' : 'Add New Donor'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="donor-name">Full Name *</label>
              <input
                id="donor-name"
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donor-email">Email *</label>
              <input
                id="donor-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donor-phone">Phone</label>
              <input
                id="donor-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donor-type">Donor Type</label>
              <select
                id="donor-type"
                className="form-select"
                value={formData.donor_type}
                onChange={(e) => setFormData({ ...formData, donor_type: e.target.value })}
              >
                <option value="individual">Individual</option>
                <option value="NGO">NGO</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            {!editingDonor && (
              <div className="form-group">
                <label className="form-label" htmlFor="donor-password">Password *</label>
                <input
                  id="donor-password"
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            )}
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

export default DonorsPage;