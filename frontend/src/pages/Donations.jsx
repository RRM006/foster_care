import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign } from 'lucide-react';
import { donations, donors, agencies } from '../api/api';
import Modal from '../components/Modal';

function DonationsPage({ user }) {
  const [donationsList, setDonationsList] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [agenciesList, setAgenciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    donor_id: '',
    agency_id: '',
    amount: '',
    purpose: '',
    donation_date: new Date().toISOString().split('T')[0],
    reference_no: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [donationsRes, donorsRes, agenciesRes] = await Promise.all([
        donations.getAll(),
        donors.getAll().catch(() => ({ data: { donors: [] } })),
        agencies.getAll()
      ]);
      setDonationsList(donationsRes.data.donations || []);
      setDonorsList(donorsRes.data.donors || []);
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
      await donations.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      loadData();
      setShowModal(false);
      setFormData({
        donor_id: '',
        agency_id: '',
        amount: '',
        purpose: '',
        donation_date: new Date().toISOString().split('T')[0],
        reference_no: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Donation failed');
    } finally {
      setSaving(false);
    }
  };

  const getDonorName = (donorId) => {
    const donor = donorsList.find(d => d._id === donorId);
    return donor?.full_name || '-';
  };

  const getAgencyName = (agencyId) => {
    const agency = agenciesList.find(a => a._id === agencyId);
    return agency?.name || '-';
  };

  const filteredDonations = donationsList.filter(donation =>
    getDonorName(donation.donor_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = donationsList.reduce((sum, d) => sum + (d.amount || 0), 0);

  if (loading) {
    return <div className="loading" role="status"><div className="spinner"></div><span className="sr-only">Loading donations...</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Donations</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} aria-hidden="true" /> Make Donation
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: '#E8F8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: '#27AE60',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} color="white" aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ color: '#27AE60' }}>৳{totalAmount.toLocaleString()}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Total Donations</p>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input" style={{ position: 'relative' }}>
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            aria-label="Search donations by donor name or reference"
          />
        </div>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="empty-state">
          <p>No donations found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Agency</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Date</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation._id}>
                  <td><strong>{getDonorName(donation.donor_id)}</strong></td>
                  <td>{getAgencyName(donation.agency_id)}</td>
                  <td><strong>৳{donation.amount?.toLocaleString()}</strong></td>
                  <td>{donation.purpose || '-'}</td>
                  <td>{donation.donation_date || '-'}</td>
                  <td>{donation.reference_no || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Make a Donation">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="donation-donor">Donor *</label>
              <select
                id="donation-donor"
                className="form-select"
                value={formData.donor_id}
                onChange={(e) => setFormData({ ...formData, donor_id: e.target.value })}
                required
              >
                <option value="">Select Donor</option>
                {donorsList.map((donor) => (
                  <option key={donor._id} value={donor._id}>{donor.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donation-agency">Agency *</label>
              <select
                id="donation-agency"
                className="form-select"
                value={formData.agency_id}
                onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
                required
              >
                <option value="">Select Agency</option>
                {agenciesList.map((agency) => (
                  <option key={agency._id} value={agency._id}>{agency.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donation-amount">Amount (BDT) *</label>
              <input
                id="donation-amount"
                type="number"
                className="form-input"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donation-purpose">Purpose</label>
              <input
                id="donation-purpose"
                type="text"
                className="form-input"
                placeholder="e.g., Food, Education, Healthcare"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donation-date">Date</label>
              <input
                id="donation-date"
                type="date"
                className="form-input"
                value={formData.donation_date}
                onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donation-ref">Reference No.</label>
              <input
                id="donation-ref"
                type="text"
                className="form-input"
                placeholder="Enter reference number"
                value={formData.reference_no}
                onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Processing...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DonationsPage;