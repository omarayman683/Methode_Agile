import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivreById } from '../../services/livres.service';
import { emprunter } from '../../services/emprunts.service';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookDetailPage() {
  const { id }  = useParams();
  const [livre, setLivre] = useState(null);
  const [msg,   setMsg]   = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getLivreById(id).then(res => setLivre(res.data.data));
  }, [id]);

  const handleEmprunter = async () => {
    try {
      await emprunter(parseInt(id));
      setMsg('Emprunt enregistré !');
      setLivre({ ...livre, disponibilite: false });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur');
    }
  };

  const handleReserver = async () => {
    try {
      await api.post('/reservations', { id_livre: parseInt(id) });
      setMsg('Réservation enregistrée !');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur');
    }
  };

  if (!livre) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Retour</button>
      <h2>{livre.titre}</h2>
      <p><strong>Auteur :</strong> {livre.auteur}</p>
      <p><strong>Catégorie :</strong> {livre.categorie || '—'}</p>
      <p><strong>Publication :</strong> {livre.date_publication?.split('T')[0] || '—'}</p>
      <p>
        <strong>Disponibilité :</strong>{' '}
        <span style={{ color: livre.disponibilite ? 'green' : 'red' }}>
          {livre.disponibilite ? 'Disponible' : 'Indisponible'}
        </span>
      </p>
      {livre.resume && <p style={{ marginTop: '1rem' }}>{livre.resume}</p>}
      {msg && <p style={{ color: 'blue', marginTop: '1rem' }}>{msg}</p>}
      {user?.role === 'adherent' && (
        <div style={{ marginTop: '1rem' }}>
          {livre.disponibilite
            ? <button onClick={handleEmprunter}>Emprunter ce livre</button>
            : <button onClick={handleReserver}>Réserver (file d'attente)</button>
          }
        </div>
      )}
    </div>
  );
}
