import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { children } from '../api/api';
import Modal from '../components/Modal';

function ChildrenPage({ user }) {
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    current_status: 'pending',
    admission_date: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await children.getAll();
      setChildrenList(response.data.children || []);
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingChild) {
        await children.update(editingChild._id, formData);
      } else {
        await children.create(formData);
      }
      loadChildren();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this child?')) return;
    
    try {
      await children.delete(id);
      loadChildren();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const openEdit = (child) => {
    setEditingChild(child);
    setFormData({
      full_name: child.full_name || '',
      gender: child.gender || '',
      date_of_birth: child.date_of_birth || '',
      current_status: child.current_status || 'pending',
      admission_date: child.admission_date || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingChild(null);
    setFormData({
      full_name: '',
      gender: '',
      date_of_birth: '',
      current_status: 'pending',
      admission_date: ''
    });
    setError('');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'in_foster': return 'badge-in-foster';
      case 'reunified': return 'badge-reunified';
      case 'adopted': return 'badge-adopted';
      default: return 'badge-pending';
    }
  };

  const filteredChildren = childrenList.filter(child =>
    child.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading children...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Children</h1>
        {(isAdmin || isStaff) && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={18} aria-hidden="true" /> Add Child
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
            placeholder="Search children..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search children by name"
          />
        </div>
      </div>

      {filteredChildren.length === 0 ? (
        <div className="empty-state">
          <p>No children found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th>Admission Date</th>
                {(isAdmin || isStaff) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child) => (
                <tr key={child._id}>
                  <td><strong>{child.full_name}</strong></td>
                  <td>{child.gender || '-'}</td>
                  <td>{child.date_of_birth || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(child.current_status)}`}>
                      {child.current_status || 'pending'}
                    </span>
                  </td>
                  <td>{child.admission_date || '-'}</td>
                  {(isAdmin || isStaff) && (
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(child)} aria-label={`Edit ${child.full_name}`}>
                          <Edit size={14} aria-hidden="true" />
                        </button>
                        {isAdmin && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(child._id)} aria-label={`Delete ${child.full_name}`}>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingChild ? 'Edit Child' : 'Add New Child'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="child-name">Full Name *</label>
              <input
                id="child-name"
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="child-gender">Gender</label>
              <select
                id="child-gender"
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="child-dob">Date of Birth</label>
              <input
                id="child-dob"
                type="date"
                className="form-input"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>



            <div className="form-group">
              <label className="form-label" htmlFor="child-status">Status</label>
              <select
                id="child-status"
                className="form-select"
                value={formData.current_status}
                onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_foster">In Foster</option>
                <option value="reunified">Reunified</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="child-admission">Admission Date</label>
              <input
                id="child-admission"
                type="date"
                className="form-input"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
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

export default ChildrenPage;