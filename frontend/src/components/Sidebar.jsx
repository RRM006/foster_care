import { NavLink } from 'react-router-dom';
import { Home, Users, Heart, Gift, DollarSign, UsersRound, Building2, LogOut, FileText } from 'lucide-react';

function Sidebar({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <aside className="sidebar">
      <div className="header-logo">
        <Building2 size={28} />
        <h1>{isAdmin ? 'Foster Care' : 'FCMS'}</h1>
      </div>
      
      {isAdmin && user?.agency_name && (
        <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '14px', color: '#B8FFB8' }}>
          {user.agency_name}
        </p>
      )}

      {!isAdmin && (
        <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '14px' }}>
          Foster Care Management
        </p>
      )}

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(isAdmin || isStaff) && (
          <NavLink to="/children" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Children</span>
          </NavLink>
        )}

        {(isAdmin || isStaff) && (
          <NavLink to="/guardians" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Heart size={20} />
            <span>Guardians</span>
          </NavLink>
        )}

        {(isAdmin || isStaff) && (
          <NavLink to="/donors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Gift size={20} />
            <span>Donors</span>
          </NavLink>
        )}

        {(isAdmin || isStaff) && (
          <NavLink to="/child-records" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Child Records</span>
          </NavLink>
        )}

        <NavLink to="/donations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <DollarSign size={20} />
          <span>Donations</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UsersRound size={20} />
            <span>Staff</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/agencies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            <span>Agencies</span>
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <div style={{ marginBottom: '16px', fontSize: '14px' }}>
          <strong>{user?.name}</strong>
          <br />
          <span style={{ opacity: 0.7, fontSize: '12px' }}>{user?.role}</span>
        </div>
        
        <button onClick={onLogout} className="sidebar-link" style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;