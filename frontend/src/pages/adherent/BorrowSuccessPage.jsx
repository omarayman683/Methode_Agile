import { useLocation, useNavigate } from 'react-router-dom';

const PRICE_PER_DAY = 1;

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function BorrowSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.confirmCode) {
    navigate('/search');
    return null;
  }

  const { confirmCode, titre, duration, startDate, endDate } = state;

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.successIcon}>✓</div>
        <h2 style={s.title}>Emprunt confirmé !</h2>
        <p style={s.subtitle}>{titre}</p>

        <div style={s.codeBlock}>
          <p style={s.codeHint}>Votre code de confirmation</p>
          <div style={s.codeValue}>{confirmCode}</div>
          <p style={s.codeNote}>Présentez ce code au comptoir de la bibliothèque pour récupérer votre livre</p>
        </div>

        <div style={s.summaryRow}>
          <span>Début</span>
          <span>{formatDate(startDate)}</span>
        </div>
        <div style={s.summaryRow}>
          <span>Retour prévu</span>
          <span>{formatDate(endDate)}</span>
        </div>
        <div style={s.summaryRow}>
          <span>Durée</span>
          <span>{duration} jours</span>
        </div>
        <div style={s.summaryRow}>
          <span>Total payé</span>
          <strong style={{ color: '#2563eb' }}>{duration * PRICE_PER_DAY}€</strong>
        </div>

        <button style={s.btn} onClick={() => navigate('/historique')}>
          Voir mes emprunts
        </button>
      </div>
    </div>
  );
}

const s = {
  container: { padding: '2rem', maxWidth: '560px', margin: '0 auto' },
  card: {
    background: 'white', borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', padding: '2rem',
  },
  successIcon: {
    width: '60px', height: '60px', background: '#e8f5e9', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', color: '#2e7d32', margin: '0 auto 1rem',
  },
  title: { textAlign: 'center', color: '#2e7d32', margin: '0 0 0.5rem' },
  subtitle: { textAlign: 'center', color: '#555', margin: '0 0 1.5rem' },
  codeBlock: {
    background: '#e3f2fd', borderRadius: '8px', padding: '1.5rem',
    textAlign: 'center', margin: '1.5rem 0',
  },
  codeHint: { fontWeight: '600', color: '#444', marginBottom: '0.75rem', margin: '0 0 0.75rem' },
  codeValue: {
    fontFamily: 'monospace', fontWeight: '800', fontSize: '2rem',
    color: '#2563eb', letterSpacing: '4px', padding: '0.5rem',
    border: '2px solid #2563eb', borderRadius: '6px', background: 'white', display: 'inline-block',
  },
  codeNote: { fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontStyle: 'italic' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem',
  },
  btn: {
    marginTop: '1.5rem', width: '100%', padding: '0.85rem',
    background: '#2563eb', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
  },
};
