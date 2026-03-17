import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      padding: '0.75rem 1.5rem',
      background: 'var(--nav-bg)',
      color: 'white',
      display: 'flex',
      gap: '1.25rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <Link to="/search" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
        Bibliothèque
      </Link>

      {/* Accès Adhérent */}
      {user?.role === 'adherent' && (
        <Link to="/historique" style={{ color: '#ccc', textDecoration: 'none' }}>Mes emprunts</Link>
      )}

      {/* --- MODIFICATION ICI --- */}
      {/* Seul le bibliothécaire voit le menu Livres */}
      {user?.role === 'bibliothecaire' && (
        <Link to="/gestion/livres" style={{ color: '#ccc', textDecoration: 'none' }}>Livres</Link>
      )}

      {/* Le Bibliothécaire ET l'Admin voient les Emprunts */}
      {(user?.role === 'bibliothecaire' || user?.role === 'administrateur') && (
        <Link to="/gestion/emprunts" style={{ color: '#ccc', textDecoration: 'none' }}>Emprunts</Link>
      )}

      {/* Seul l'Admin voit le menu Utilisateurs */}
      {user?.role === 'administrateur' && (
        <Link to="/admin/utilisateurs" style={{ color: '#ccc', textDecoration: 'none' }}>Utilisateurs</Link>
      )}
      {/* ------------------------ */}

      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '0.3rem 0.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'background 0.2s',
          }}
        >
          {isDark ? '☀️ Clair' : '🌙 Sombre'}
        </button>

        {user ? (
          <>
            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
              {user.prenom} · {user.role}
            </span>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login" style={{ color: '#ccc', textDecoration: 'none' }}>Connexion</Link>
        )}
      </span>
    </nav>
  );
}