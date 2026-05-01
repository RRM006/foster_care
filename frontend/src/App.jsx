import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import Guardians from './pages/Guardians';
import Donors from './pages/Donors';
import Donations from './pages/Donations';
import Staff from './pages/Staff';
import Agencies from './pages/Agencies';
import ChildRecords from './pages/ChildRecords';
import NotFound from './pages/NotFound';
import GovDashboard from './pages/GovDashboard';
import AgencySetup from './pages/AgencySetup';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSetupComplete = (agencyName) => {
    // Update user state with setup_complete = true and the new agency name
    const updatedUser = { ...user, setup_complete: true, agency_name: agencyName };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // Not logged in — show auth pages
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Government Admin — separate portal with no sidebar nav for center management
  if (user.role === 'government_admin') {
    return (
      <BrowserRouter>
        <div className="app-container">
          <Sidebar user={user} onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<GovDashboard user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  }

  // Agency Admin with pending setup — force setup page
  if (user.role === 'admin' && user.setup_complete === false) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AgencySetup user={user} onSetupComplete={handleSetupComplete} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Normal authenticated flow (admin, staff, donor, guardian)
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar user={user} onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/children" element={<Children user={user} />} />
            <Route path="/guardians" element={<Guardians user={user} />} />
            <Route path="/donors" element={<Donors user={user} />} />
            <Route path="/donations" element={<Donations user={user} />} />
            <Route path="/staff" element={<Staff user={user} />} />
            <Route path="/agencies" element={<Agencies user={user} />} />
            <Route path="/child-records" element={<ChildRecords user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;