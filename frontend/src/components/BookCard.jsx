import { Link } from 'react-router-dom';

export default function BookCard({ livre }) {
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
      <Link to={`/livres/${livre.id_livre}`} style={{ marginTop: 'auto' }}>Voir détail →</Link>
    </div>
  );
}
