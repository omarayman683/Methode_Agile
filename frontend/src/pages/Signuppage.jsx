import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from '../services/auth.service';

export default function SignupPage() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', confirm: '', role: 'adherent'
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.mot_de_passe !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await registerService({
        nom:          form.nom,
        prenom:       form.prenom,
        email:        form.email,
        mot_de_passe: form.mot_de_passe,
        role:         form.role,
      });
      setSuccess('Compte créé avec succès ! Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error ? `${data.message} : ${data.error}` : (data?.message || 'Erreur lors de la création du compte.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '360px', margin: '5rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Créer un compte</h2>

      {error   && <p style={{ color: 'red',   margin: '0 0 1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', margin: '0 0 1rem' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          placeholder="Prénom"
          value={form.prenom}
          onChange={e => setForm({ ...form, prenom: e.target.value })}
          required
        />
        <input
          placeholder="Nom"
          value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          required
        />
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
        <input
          type="password" placeholder="Confirmer le mot de passe"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
          required
        />

        <div>
          <p style={{ margin: '0 0 0.4rem', fontWeight: 500 }}>Je suis :</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="role"
              value="adherent"
              checked={form.role === 'adherent'}
              onChange={e => setForm({ ...form, role: e.target.value })}
            />
            Adhérent
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="role"
              value="bibliothecaire"
              checked={form.role === 'bibliothecaire'}
              onChange={e => setForm({ ...form, role: e.target.value })}
            />
            Bibliothécaire
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Création...' : "S'inscrire"}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
        Déjà un compte ?{' '}
        <Link to="/login" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
