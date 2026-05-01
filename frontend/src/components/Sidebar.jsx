import { NavLink } from 'react-router-dom';
import { Home, Users, Heart, Gift, DollarSign, UsersRound, Building2, LogOut, FileText, Menu, Shield } from 'lucide-react';

function Sidebar({ user, onLogout, isOpen, onToggle }) {
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isGovAdmin = user?.role === 'government_admin';

  return (
    <>
      <button 
        className="mobile-menu-btn"
        onClick={onToggle}
        aria-label="Toggle menu"
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 150,
          padding: '8px',
          background: 'var(--surface-card)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer'
        }}
      >
        <Menu size={24} />
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {isGovAdmin ? <Shield size={24} /> : <Building2 size={24} />}
          <h1>FCMS</h1>
        </div>
        
        {isGovAdmin && (
          <p className="sidebar-agency">Government Portal</p>
        )}

        {!isGovAdmin && (isAdmin || isStaff) && user?.agency_name && (
          <p className="sidebar-agency">{user.agency_name}</p>
        )}

        {!isGovAdmin && !isAdmin && !isStaff && (
          <p className="sidebar-agency">Foster Care Management</p>
        )}

        <div className="sidebar-section-title">Main Menu</div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>{isGovAdmin ? 'Dashboard' : 'Dashboard'}</span>
          </NavLink>

          {/* Government Admin sees only the dashboard — no center-specific links */}
          {!isGovAdmin && (isAdmin || isStaff) && (
            <NavLink to="/children" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Children</span>
            </NavLink>
          )}

          {!isGovAdmin && (isAdmin || isStaff) && (
            <NavLink to="/guardians" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Heart size={18} />
              <span>Guardians</span>
            </NavLink>
          )}

          {!isGovAdmin && (isAdmin || isStaff) && (
            <NavLink to="/donors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Gift size={18} />
              <span>Donors</span>
            </NavLink>
          )}

          {!isGovAdmin && (isAdmin || isStaff) && (
            <NavLink to="/child-records" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Child Records</span>
            </NavLink>
          )}

          {!isGovAdmin && (
            <NavLink to="/donations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <DollarSign size={18} />
              <span>Donations</span>
            </NavLink>
          )}
        </nav>

        {!isGovAdmin && (isAdmin) && (
          <>
            <div className="sidebar-section-title">Administration</div>
            <nav className="sidebar-nav">
              {isAdmin && (
                <NavLink to="/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <UsersRound size={18} />
                  <span>Staff</span>
                </NavLink>
              )}

              {isAdmin && (
                <NavLink to="/agencies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Building2 size={18} />
                  <span>Agencies</span>
                </NavLink>
              )}
            </nav>
          </>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                {isGovAdmin ? 'Government Admin' : user?.role}
              </div>
            </div>
          </div>
          
          <button onClick={onLogout} className="sidebar-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 150,
          }}
          onClick={onToggle}
        />
      )}
    </>
  );
}

export default Sidebar;