import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { staff as staffApi, agencies } from '../api/api';
import Modal from '../components/Modal';

function StaffPage({ user }) {
  const [staffList, setStaffList] = useState([]);
  const [agenciesList, setAgenciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'staff',
    agency_id: '',
    status: 'active',
    password: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffRes, agenciesRes] = await Promise.all([
        staffApi.getAll(),
        agencies.getAll()
      ]);
      setStaffList(staffRes.data.staff || []);
      setAgenciesList(agenciesRes.data.agencies || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingStaff) {
        const { password, ...updateData } = formData;
        await staffApi.update(editingStaff._id, password ? formData : updateData);
      } else {
        await staffApi.create(formData);
      }
      loadData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await staffApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const openEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role_field || 'staff',
      agency_id: member.agency_id || '',
      status: member.status || 'active',
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'staff',
      agency_id: '',
      status: 'active',
      password: ''
    });
    setError('');
  };

  const getAgencyName = (agencyId) => {
    if (!agencyId) return '-';
    const agency = agenciesList.find(a => a._id === agencyId);
    return agency?.name || '-';
  };

  const filteredStaff = staffList.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading staff...</span></div>;
  }

  if (!isAdmin) {
    return <div className="empty-state"><p>Access denied. Admin only.</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Staff</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} aria-hidden="true" /> Add Staff
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input" style={{ position: 'relative' }}>
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search staff by name or email"
          />
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="empty-state">
          <p>No staff members found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Agency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member._id}>
                  <td><strong>{member.full_name}</strong></td>
                  <td>{member.email}</td>
                  <td>{member.role_field || 'staff'}</td>
                  <td>{getAgencyName(member.agency_id)}</td>
                  <td>
                    <span className={`badge ${member.status === 'active' ? 'badge-verified' : 'badge-unverified'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(member)} aria-label={`Edit ${member.full_name}`}>
                        <Edit size={14} aria-hidden="true" />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(member._id)} aria-label={`Delete ${member.full_name}`}>
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStaff ? 'Edit Staff' : 'Add New Staff'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="staff-name">Full Name *</label>
              <input
                id="staff-name"
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="staff-email">Email *</label>
              <input
                id="staff-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="staff-phone">Phone</label>
              <input
                id="staff-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="staff-role">Role</label>
              <select
                id="staff-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="staff-agency">Agency</label>
              <select
                id="staff-agency"
                className="form-select"
                value={formData.agency_id}
                onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
              >
                <option value="">Select Agency</option>
                {agenciesList.map((agency) => (
                  <option key={agency._id} value={agency._id}>{agency.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="staff-status">Status</label>
              <select
                id="staff-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {!editingStaff && (
              <div className="form-group">
                <label className="form-label" htmlFor="staff-password">Password *</label>
                <input
                  id="staff-password"
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

export default StaffPage;