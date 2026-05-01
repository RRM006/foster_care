import { useState, useEffect } from 'react';
import { Building2, Users, Heart, Gift, DollarSign, UsersRound, Activity, Plus, Trash2, Search, Shield, AlertCircle } from 'lucide-react';
import { gov } from '../api/api';
import Modal from '../components/Modal';

function GovDashboard({ user }) {
  const [statsData, setStatsData] = useState({
    total_agencies: 0,
    total_children: 0,
    total_guardians: 0,
    total_donors: 0,
    total_staff: 0,
    total_donations: 0,
    pending_children: 0,
    in_foster: 0,
    agencies_pending_setup: 0,
    total_donation_amount: 0,
  });
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, agenciesRes] = await Promise.all([
        gov.getStats(),
        gov.getAgencies(),
      ]);
      setStatsData(statsRes.data);
      setAgencies(agenciesRes.data.agencies || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await gov.createAgency(formData);
      setShowModal(false);
      setFormData({ email: '', password: '' });
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create agency');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAgency = async (agencyId) => {
    try {
      await gov.deleteAgency(agencyId);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete agency:', err);
    }
  };

  const filteredAgencies = agencies.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.admin_email || '').toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Agencies', value: statsData.total_agencies, icon: Building2, color: 'guardians' },
    { label: 'Total Children', value: statsData.total_children, icon: Users, color: 'children' },
    { label: 'In Foster Care', value: statsData.in_foster, icon: Heart, color: 'donors' },
    { label: 'Pending Placement', value: statsData.pending_children, icon: Activity, color: 'donations' },
    { label: 'Total Donors', value: statsData.total_donors, icon: Gift, color: 'donors' },
    { label: 'Total Staff', value: statsData.total_staff, icon: UsersRound, color: 'children' },
    { label: 'Total Donations', value: statsData.total_donations, icon: DollarSign, color: 'donations' },
    { label: 'Pending Setup', value: statsData.agencies_pending_setup, icon: AlertCircle, color: 'donations' },
  ];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={20} color="#111" />
            <h1>Government Admin Portal</h1>
          </div>
          <p style={{ color: '#666' }}>Nationwide Foster Care Overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Agency
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="card stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agencies Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h3>Child Welfare Agencies</h3>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Agency Name</th>
                <th>Admin Email</th>
                <th>Status</th>
                <th>Children</th>
                <th>Staff</th>
                <th>Donors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
                    No agencies found
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => (
                  <tr key={agency._id}>
                    <td style={{ fontWeight: 500 }}>{agency.name || '(Pending Setup)'}</td>
                    <td>{agency.admin_email || agency.email}</td>
                    <td>
                      <span className={`badge ${agency.setup_complete ? 'badge-verified' : 'badge-pending'}`}>
                        {agency.setup_complete ? 'Active' : 'Pending Setup'}
                      </span>
                    </td>
                    <td>{agency.children_count || 0}</td>
                    <td>{agency.staff_count || 0}</td>
                    <td>{agency.donors_count || 0}</td>
                    <td>
                      {deleteConfirm === agency._id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 12px', fontSize: '12px', background: '#ef4444' }}
                            onClick={() => handleDeleteAgency(agency._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #e5e7eb' }}
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn"
                          style={{ padding: '4px 8px', color: '#ef4444', border: '1px solid #fecaca' }}
                          onClick={() => setDeleteConfirm(agency._id)}
                          title="Delete agency"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Agency Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(''); }}>
        <h2 style={{ marginBottom: '16px' }}>Add New Agency</h2>
        <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
          Provide login credentials for the agency admin. They will fill in their agency details on first login.
        </p>

        {formError && (
          <div className="alert alert-error" role="alert">{formError}</div>
        )}

        <form onSubmit={handleCreateAgency}>
          <div className="form-group">
            <label className="form-label" htmlFor="agency-email">Admin Email</label>
            <input
              id="agency-email"
              type="email"
              className="form-input"
              placeholder="admin@agency.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="agency-password">Password</label>
            <input
              id="agency-password"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ border: '1px solid #e5e7eb' }} onClick={() => { setShowModal(false); setFormError(''); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Agency'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default GovDashboard;
