import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>NeuroApp</h1>
        <p>Welcome, {user?.name}</p>
        <nav>
          <Link className={location.pathname === '/dashboard' ? 'active' : ''} to="/dashboard">
            Dashboard
          </Link>
          <Link
            className={location.pathname === '/sensory-tests' ? 'active' : ''}
            to="/sensory-tests"
          >
            Sensory Tests
          </Link>
        </nav>
        <button onClick={handleLogout} type="button" className="secondary-button">
          Logout
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
