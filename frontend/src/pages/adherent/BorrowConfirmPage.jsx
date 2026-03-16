import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivreById } from '../../services/livres.service';
import { emprunter } from '../../services/emprunts.service';

const PRICE_PER_DAY = 1; // 1€ per day

const durationOptions = [
  { label: '1 semaine', days: 7 },
  { label: '2 semaines', days: 14 },
  { label: '3 semaines', days: 21 },
  { label: '1 mois', days: 30 },
];

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BorrowConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livre, setLivre] = useState(null);
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pickupCode] = useState(() =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  useEffect(() => {
    getLivreById(id).then(res => setLivre(res.data.data));
  }, [id]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await emprunter(parseInt(id), duration);
      setConfirmed(true);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de l'emprunt");
    } finally {
      setLoading(false);
    }
  };

  if (!livre) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  // ── Success screen ──────────────────────────────────────────────
  if (confirmed) {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.successIcon}>✓</div>
          <h2 style={{ textAlign: 'center', color: '#2e7d32' }}>Emprunt confirmé !</h2>
          <p style={{ textAlign: 'center', color: '#555' }}>{livre.titre}</p>

          <div style={s.codeBlock}>
            <p style={s.codeHint}>Votre code de récupération</p>
            <div style={s.codeValue}>{pickupCode}</div>
            <p style={s.codeNote}>Présentez ce code au comptoir de la bibliothèque pour récupérer votre livre</p>
          </div>

          <div style={s.summaryRow}>
            <span>Période d'emprunt</span>
            <span>{formatDate(startDate)} → {formatDate(endDate)}</span>
          </div>
          <div style={s.summaryRow}>
            <span>Durée</span>
            <span>{duration} jours</span>
          </div>
          <div style={s.summaryRow}>
            <span>Total payé</span>
            <strong style={{ color: '#2563eb' }}>{duration * PRICE_PER_DAY}€</strong>
          </div>

          <button style={s.confirmBtn} onClick={() => navigate('/historique')}>
            Voir mes emprunts
          </button>
        </div>
      </div>
    );
  }

  // ── Selection screen ────────────────────────────────────────────
  return (
    <div style={s.container}>
      <button onClick={() => navigate(-1)} style={s.backBtn}>← Retour</button>

      <div style={s.card}>
        <h2 style={s.title}>Emprunter ce livre</h2>

        {/* Book info */}
        <div style={s.bookRow}>
          <div>
            <div style={s.bookTitle}>{livre.titre}</div>
            <div style={s.bookAuthor}>{livre.auteur}</div>
          </div>
          <span style={s.badge}>Disponible</span>
        </div>

        <hr style={s.hr} />

        {/* Duration picker */}
        <p style={s.sectionLabel}>Choisissez la durée d'emprunt</p>
        <div style={s.durationGrid}>
          {durationOptions.map(opt => (
            <button
              key={opt.days}
              style={duration === opt.days ? { ...s.durBtn, ...s.durBtnActive } : s.durBtn}
              onClick={() => setDuration(opt.days)}
            >
              <span style={s.durLabel}>{opt.label}</span>
              <span style={s.durDays}>{opt.days} jours</span>
              <span style={duration === opt.days ? { ...s.durPrice, color: 'white' } : s.durPrice}>
                {opt.days * PRICE_PER_DAY}€
              </span>
            </button>
          ))}
        </div>

        <hr style={s.hr} />

        {/* Date range */}
        <p style={s.sectionLabel}>Période de disponibilité</p>
        <div style={s.dateRange}>
          <div style={s.dateBox}>
            <div style={s.dateBoxLabel}>Début</div>
            <div style={s.dateBoxValue}>{formatDate(startDate)}</div>
          </div>
          <div style={s.dateArrow}>→</div>
          <div style={{ ...s.dateBox, borderColor: '#d32f2f' }}>
            <div style={s.dateBoxLabel}>Retour prévu</div>
            <div style={{ ...s.dateBoxValue, color: '#d32f2f' }}>{formatDate(endDate)}</div>
          </div>
        </div>

        <hr style={s.hr} />

        {/* Price summary */}
        <div style={s.priceSummary}>
          <span style={s.priceLabel}>Total</span>
          <span style={s.priceValue}>{duration * PRICE_PER_DAY}€</span>
        </div>

        <p style={s.priceNote}>{PRICE_PER_DAY}€ × {duration} jours</p>

        {msg && <p style={s.errorMsg}>{msg}</p>}

        {/* Pickup code preview */}
        <div style={s.codePreview}>
          <span style={s.codePreviewLabel}>Code de récupération qui vous sera attribué :</span>
          <span style={s.codePreviewValue}>{pickupCode}</span>
        </div>

        <div style={s.btnRow}>
          <button onClick={() => navigate(-1)} style={s.cancelBtn} disabled={loading}>
            Annuler
          </button>
          <button onClick={handleConfirm} style={s.confirmBtn} disabled={loading}>
            {loading ? 'Traitement...' : 'Confirmer l\'emprunt'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { padding: '2rem', maxWidth: '560px', margin: '0 auto' },
  backBtn: {
    marginBottom: '1rem', padding: '0.4rem 1rem',
    background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  card: {
    background: 'white', borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', padding: '2rem',
  },
  title: { margin: '0 0 1.5rem', fontSize: '1.5rem', color: '#222' },
  bookRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#222' },
  bookAuthor: { color: '#666', marginTop: '0.25rem' },
  badge: {
    background: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem',
    fontWeight: '600', padding: '0.25rem 0.6rem', borderRadius: '20px',
  },
  hr: { border: 'none', borderTop: '1px solid #eee', margin: '1.5rem 0' },
  sectionLabel: { fontWeight: '600', color: '#444', marginBottom: '1rem' },
  durationGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  durBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0.85rem', border: '2px solid #ddd', borderRadius: '8px',
    background: 'white', cursor: 'pointer', gap: '0.2rem',
  },
  durBtnActive: { border: '2px solid #2563eb', background: '#2563eb', color: 'white' },
  durLabel: { fontWeight: '600', fontSize: '0.95rem' },
  durDays: { fontSize: '0.8rem', opacity: 0.7 },
  durPrice: { fontWeight: '700', fontSize: '1rem', color: '#2563eb' },
  dateRange: { display: 'flex', alignItems: 'center', gap: '1rem' },
  dateBox: {
    flex: 1, padding: '1rem', border: '2px solid #2563eb',
    borderRadius: '8px', textAlign: 'center',
  },
  dateBoxLabel: { fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase' },
  dateBoxValue: { fontWeight: '700', color: '#2563eb' },
  dateArrow: { fontSize: '1.5rem', color: '#999' },
  priceSummary: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem', background: '#f0f7ff', borderRadius: '8px',
  },
  priceLabel: { fontWeight: '600', fontSize: '1.1rem' },
  priceValue: { fontWeight: '800', fontSize: '1.6rem', color: '#2563eb' },
  priceNote: { color: '#888', fontSize: '0.85rem', margin: '0.5rem 0 0' },
  errorMsg: { color: 'red', marginTop: '1rem', fontWeight: '600' },
  codePreview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#f5f5f5', borderRadius: '6px',
  },
  codePreviewLabel: { fontSize: '0.85rem', color: '#666' },
  codePreviewValue: {
    fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem',
    color: '#2563eb', letterSpacing: '2px',
  },
  btnRow: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  cancelBtn: {
    padding: '0.75rem 1.5rem', background: '#eee', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '1rem',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
  },
  // success screen
  successIcon: {
    width: '60px', height: '60px', background: '#e8f5e9', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', color: '#2e7d32', margin: '0 auto 1rem',
  },
  codeBlock: {
    background: '#e3f2fd', borderRadius: '8px', padding: '1.5rem',
    textAlign: 'center', margin: '1.5rem 0',
  },
  codeHint: { fontWeight: '600', color: '#444', marginBottom: '0.75rem' },
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
};
