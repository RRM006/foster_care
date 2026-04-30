import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { auth, agencies } from '../api/api';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    agencyName: '',
    agencyId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agenciesList, setAgenciesList] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const navigate = useNavigate();

  const needsAgency = ['staff', 'donor', 'guardian'].includes(formData.role);

  useEffect(() => {
    if (needsAgency) {
      setAgenciesLoading(true);
      agencies.getPublic()
        .then(res => {
          setAgenciesList(res.data.agencies || []);
        })
        .catch(err => {
          console.error('Failed to load agencies:', err);
          setAgenciesList([]);
        })
        .finally(() => {
          setAgenciesLoading(false);
        });
    }
  }, [formData.role]);

  useEffect(() => {
    if (!needsAgency) {
      setFormData(prev => ({ ...prev, agencyId: '' }));
    }
  }, [needsAgency]);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (needsAgency && !formData.agencyId) {
      setError('Please select a Foster Care Center');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      };
      
      if (formData.role === 'admin' && formData.agencyName) {
        registerData.agencyName = formData.agencyName;
      }
      
      if (needsAgency && formData.agencyId) {
        registerData.agency_id = formData.agencyId;
      }
      
      const response = await auth.register(registerData);
      
      const { token, user } = response.data;
      
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agency_name: user.agency_name
      }, token);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={32} color="#111111" aria-hidden="true" />
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111111' }}>FCMS</h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Create your account</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
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
            <label className="form-label" htmlFor="reg-role">I am a...</label>
            <select id="reg-role" name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="donor">Donor</option>
              <option value="staff">Staff/Social Worker</option>
              <option value="guardian">Guardian</option>
              <option value="admin">Admin (Foster Care Center)</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-agency-name">Foster Care Center Name</label>
              <input
                id="reg-agency-name"
                type="text"
                name="agencyName"
                className="form-input"
                placeholder="Enter your center name"
                value={formData.agencyName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {needsAgency && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-agency-select">Select Foster Care Center</label>
              <select
                id="reg-agency-select"
                name="agencyId"
                className="form-select"
                value={formData.agencyId}
                onChange={handleChange}
                disabled={agenciesLoading}
                required
              >
                <option value="">{agenciesLoading ? 'Loading...' : 'Select a center'}</option>
                {agenciesList.map(agency => (
                  <option key={agency._id} value={agency._id}>{agency.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: '40px' }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#111111' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;