import { useState, useEffect } from 'react';
import { Plus, Search, Edit, FileText, Activity, GraduationCap } from 'lucide-react';
import { childRecords, children } from '../api/api';
import Modal from '../components/Modal';

function ChildRecordsPage({ user }) {
  const [recordsList, setRecordsList] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    child_id: '',
    health_status: '',
    education_level: '',
    last_visit_date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsRes, childrenRes] = await Promise.all([
        childRecords.getAll(),
        children.getAll()
      ]);
      setRecordsList(recordsRes.data.records || []);
      setChildrenList(childrenRes.data.children || []);
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
      if (editingRecord) {
        await childRecords.update(editingRecord._id, formData);
      } else {
        await childRecords.create(formData);
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

  const openEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      child_id: record.child_id || '',
      health_status: record.health_status || '',
      education_level: record.education_level || '',
      last_visit_date: record.last_visit_date || '',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      child_id: '',
      health_status: '',
      education_level: '',
      last_visit_date: '',
      notes: ''
    });
    setError('');
  };

  const getChildName = (childId) => {
    const child = childrenList.find(c => c._id === childId);
    return child?.full_name || '-';
  };

  const filteredRecords = recordsList.filter(record =>
    getChildName(record.child_id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.health_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading records...</span></div>;
  }

  if (!isAdmin && !isStaff) {
    return <div className="empty-state"><p>Access denied. Staff only.</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Child Records</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} aria-hidden="true" /> Add Record
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input" style={{ position: 'relative' }}>
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search records by child name or health status"
          />
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} aria-hidden="true" />
          <p>No child records found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Health Status</th>
                <th>Education Level</th>
                <th>Last Visit</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td><strong>{getChildName(record.child_id)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={14} color="#E74C3C" aria-hidden="true" />
                      {record.health_status || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={14} color="#3498DB" aria-hidden="true" />
                      {record.education_level || '-'}
                    </div>
                  </td>
                  <td>{record.last_visit_date || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.notes || '-'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(record)} aria-label={`Edit record for ${getChildName(record.child_id)}`}>
                        <Edit size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRecord ? 'Edit Record' : 'Add Child Record'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="record-child">Child *</label>
              <select
                id="record-child"
                className="form-select"
                value={formData.child_id}
                onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                required
              >
                <option value="">Select Child</option>
                {childrenList.map((child) => (
                  <option key={child._id} value={child._id}>{child.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-health">Health Status</label>
              <input
                id="record-health"
                type="text"
                className="form-input"
                placeholder="e.g., Good, Needs attention, Under treatment"
                value={formData.health_status}
                onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-education">Education Level</label>
              <select
                id="record-education"
                className="form-select"
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
              >
                <option value="">Select Level</option>
                <option value="Not in school">Not in school</option>
                <option value="Pre-primary">Pre-primary</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Vocational">Vocational</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-visit">Last Visit Date</label>
              <input
                id="record-visit"
                type="date"
                className="form-input"
                value={formData.last_visit_date}
                onChange={(e) => setFormData({ ...formData, last_visit_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-notes">Notes</label>
              <textarea
                id="record-notes"
                className="form-textarea"
                placeholder="Additional notes about health and education..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default ChildRecordsPage;