import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form,  setForm]  = useState({ email: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginService(form.email, form.mot_de_passe);
      login(res.data.data.user, res.data.data.token);
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div style={{
      maxWidth: '360px', margin: '5rem auto', padding: '2rem',
      border: '1px solid var(--border)', borderRadius: '8px',
      background: 'var(--bg-card)',
    }}>
      <h2 style={{ marginTop: 0, color: 'var(--text)' }}>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email" placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password" placeholder="Mot de passe"
          value={form.mot_de_passe}
          onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
          required
        />
        <button type="submit">Se connecter</button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Pas encore de compte ?{' '}
        <Link to="/signup" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
