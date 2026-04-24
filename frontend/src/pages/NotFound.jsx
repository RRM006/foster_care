import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <AlertCircle size={64} color="#E74C3C" style={{ marginBottom: '16px' }} />
      <h1 style={{ marginBottom: '8px' }}>404</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Page not found</p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} /> Go Home
      </Link>
    </div>
  );
}

export default NotFound;