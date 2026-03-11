import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navStyle = {
  padding: '0.75rem 1.5rem',
  background: '#1a1a2e',
  color: 'white',
  display: 'flex',
  gap: '1.25rem',
  alignItems: 'center',
  flexWrap: 'wrap',
};
const linkStyle = { color: '#ccc', textDecoration: 'none' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={navStyle}>
      <Link to="/search" style={{ ...linkStyle, color: 'white', fontWeight: 'bold' }}>
        Bibliothèque
      </Link>

      {user?.role === 'adherent' && (
        <Link to="/historique" style={linkStyle}>Mes emprunts</Link>
      )}

      {(user?.role === 'bibliothecaire' || user?.role === 'administrateur') && (
        <>
          <Link to="/gestion/livres"   style={linkStyle}>Livres</Link>
          <Link to="/gestion/emprunts" style={linkStyle}>Emprunts</Link>
        </>
      )}

      {user?.role === 'administrateur' && (
        <Link to="/admin/utilisateurs" style={linkStyle}>Utilisateurs</Link>
      )}

      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
              {user.prenom} · {user.role}
            </span>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login" style={linkStyle}>Connexion</Link>
        )}
      </span>
    </nav>
  );
}
