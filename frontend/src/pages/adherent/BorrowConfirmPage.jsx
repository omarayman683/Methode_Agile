import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivreById } from '../../services/livres.service';
import { emprunter } from '../../services/emprunts.service';

const PRICE_PER_DAY = 1;

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

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  useEffect(() => {
    getLivreById(id).then(res => setLivre(res.data.data));
  }, [id]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await emprunter(parseInt(id), duration);
      const idEmprunt = res.data.data.id_emprunt;
      navigate('/emprunt/confirmation', {
        state: {
          confirmCode: 'EMP-' + String(idEmprunt).padStart(5, '0'),
          titre: livre.titre,
          duration,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de l'emprunt");
    } finally {
      setLoading(false);
    }
  };

  if (!livre) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  return (
    <div style={s.container}>
      <button onClick={() => navigate(-1)} style={s.backBtn}>← Retour</button>

      <div style={s.card}>
        <h2 style={s.title}>Emprunter ce livre</h2>

        <div style={s.bookRow}>
          <div>
            <div style={s.bookTitle}>{livre.titre}</div>
            <div style={s.bookAuthor}>{livre.auteur}</div>
          </div>
          <span style={s.badge}>Disponible</span>
        </div>

        <hr style={s.hr} />

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

        <div style={s.priceSummary}>
          <span style={s.priceLabel}>Total</span>
          <span style={s.priceValue}>{duration * PRICE_PER_DAY}€</span>
        </div>

        <p style={s.priceNote}>{PRICE_PER_DAY}€ × {duration} jours</p>

        {msg && <p style={s.errorMsg}>{msg}</p>}

        <div style={s.btnRow}>
          <button onClick={() => navigate(-1)} style={s.cancelBtn} disabled={loading}>
            Annuler
          </button>
          <button onClick={handleConfirm} style={s.confirmBtn} disabled={loading}>
            {loading ? 'Traitement...' : "Confirmer l'emprunt"}
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
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: '4px', cursor: 'pointer', color: 'var(--text)',
  },
  card: {
    background: 'var(--bg-card)', borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', padding: '2rem',
  },
  title: { margin: '0 0 1.5rem', fontSize: '1.5rem', color: 'var(--text)' },
  bookRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' },
  bookAuthor: { color: 'var(--text-muted)', marginTop: '0.25rem' },
  badge: {
    background: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem',
    fontWeight: '600', padding: '0.25rem 0.6rem', borderRadius: '20px',
  },
  hr: { border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' },
  sectionLabel: { fontWeight: '600', color: 'var(--text)', marginBottom: '1rem' },
  durationGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  durBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0.85rem', border: '2px solid var(--border)', borderRadius: '8px',
    background: 'var(--bg-card)', cursor: 'pointer', gap: '0.2rem', color: 'var(--text)',
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
  dateBoxLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase' },
  dateBoxValue: { fontWeight: '700', color: '#2563eb' },
  dateArrow: { fontSize: '1.5rem', color: 'var(--text-muted)' },
  priceSummary: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px',
  },
  priceLabel: { fontWeight: '600', fontSize: '1.1rem', color: 'var(--text)' },
  priceValue: { fontWeight: '800', fontSize: '1.6rem', color: '#2563eb' },
  priceNote: { color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0' },
  errorMsg: { color: 'red', marginTop: '1rem', fontWeight: '600' },
  btnRow: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  cancelBtn: {
    padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: '6px',
    cursor: 'pointer', fontSize: '1rem', color: 'var(--text)',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
  },
};
