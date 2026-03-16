import { Link } from 'react-router-dom';
import { useState } from 'react';
import { emprunter } from '../services/emprunts.service';
import { useAuth } from '../context/AuthContext';

export default function BookCard({ livre, onUpdate }) {
  const [msg, setMsg] = useState('');
  const { user } = useAuth();

  const handleEmprunter = async (e) => {
    e.preventDefault();
    try {
      await emprunter(livre.id_livre);
      setMsg('Emprunt enregistré !');
      if (onUpdate) onUpdate(livre.id_livre);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur emprunt');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd', padding: '1rem', borderRadius: '8px',
      width: '210px', display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{livre.titre}</h3>
      <p style={{ margin: 0, color: '#555' }}>{livre.auteur}</p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{livre.categorie}</p>
      <p style={{ margin: '0.25rem 0', fontWeight: 'bold', color: livre.disponibilite ? 'green' : 'red' }}>
        {livre.disponibilite ? 'Disponible' : 'Indisponible'}
      </p>
      {msg && <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'green' }}>{msg}</p>}
      <Link to={`/livres/${livre.id_livre}`} style={{ marginTop: 'auto' }}>Voir détail →</Link>
      {user?.role === 'adherent' && livre.disponibilite && (
        <button onClick={handleEmprunter} style={{ marginTop: '0.5rem', padding: '0.4rem', fontSize: '0.8rem', flex: 1 }}>Emprunter</button>
      )}    </div>
  );
}
