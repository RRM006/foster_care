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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

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