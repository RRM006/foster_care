import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { guardians, children } from '../api/api';
import Modal from '../components/Modal';

function GuardiansPage({ user }) {
  const [guardiansList, setGuardiansList] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    national_id: '',
    child_id: '',
    verified: false
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadGuardians();
    loadChildren();
  }, []);

  const loadGuardians = async () => {
    try {
      const response = await guardians.getAll();
      setGuardiansList(response.data.guardians || []);
    } catch (err) {
      console.error('Failed to load guardians:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async () => {
    try {
      const response = await children.getAll();
      setChildrenList(response.data.children || []);
    } catch (err) {
      console.error('Failed to load children:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingGuardian) {
        await guardians.update(editingGuardian._id, formData);
      } else {
        await guardians.create(formData);
      }
      loadGuardians();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this guardian?')) return;
    
    try {
      await guardians.delete(id);
      loadGuardians();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const openEdit = (guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      full_name: guardian.full_name || '',
      phone: guardian.phone || '',
      address: guardian.address || '',
      national_id: guardian.national_id || '',
      child_id: guardian.child_id || '',
      verified: guardian.verified || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingGuardian(null);
    setFormData({
      full_name: '',
      phone: '',
      address: '',
      national_id: '',
      child_id: '',
      verified: false
    });
    setError('');
  };

  const getChildName = (childId) => {
    const child = childrenList.find(c => c._id === childId);
    return child?.full_name || '-';
  };

  const filteredGuardians = guardiansList.filter(guardian =>
    guardian.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading guardians...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Guardians</h1>
        {(isAdmin || isStaff) && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={18} aria-hidden="true" /> Add Guardian
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
            placeholder="Search guardians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search guardians by name"
          />
        </div>
      </div>

      {filteredGuardians.length === 0 ? (
        <div className="empty-state">
          <p>No guardians found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Assigned Child</th>
                <th>Verified</th>
                {(isAdmin || isStaff) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGuardians.map((guardian) => (
                <tr key={guardian._id}>
                  <td><strong>{guardian.full_name}</strong></td>
                  <td>{guardian.phone || '-'}</td>
                  <td>{guardian.address || '-'}</td>
                  <td>{getChildName(guardian.child_id)}</td>
                  <td>
                    <span className={`badge ${guardian.verified ? 'badge-verified' : 'badge-unverified'}`}>
                      {guardian.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  {(isAdmin || isStaff) && (
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(guardian)} aria-label={`Edit ${guardian.full_name}`}>
                          <Edit size={14} aria-hidden="true" />
                        </button>
                        {isAdmin && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(guardian._id)} aria-label={`Delete ${guardian.full_name}`}>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingGuardian ? 'Edit Guardian' : 'Add New Guardian'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="guardian-name">Full Name *</label>
              <input
                id="guardian-name"
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="guardian-phone">Phone</label>
              <input
                id="guardian-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="guardian-address">Address</label>
              <textarea
                id="guardian-address"
                className="form-textarea"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="guardian-nid">National ID</label>
              <input
                id="guardian-nid"
                type="text"
                className="form-input"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="guardian-child">Assign to Child</label>
              <select
                id="guardian-child"
                className="form-select"
                value={formData.child_id}
                onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
              >
                <option value="">Select Child</option>
                {childrenList.map((child) => (
                  <option key={child._id} value={child._id}>{child.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }} htmlFor="guardian-verified">
                <input
                  id="guardian-verified"
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                />
                Verified Guardian
              </label>
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

export default GuardiansPage;