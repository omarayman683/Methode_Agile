import { useState } from 'react';

export default function EmpuntModal({ livre, onConfirm, onCancel, loading = false }) {
  const [pickupCode] = useState(Math.random().toString(36).substring(2, 10).toUpperCase());
  const [duration, setDuration] = useState(7); // days

  const PRICE_PER_DAY = 1; // 1€ per day
  const borrowPrice = duration * PRICE_PER_DAY;

  // Calculate return date
  const today = new Date();
  const returnDate = new Date(today);
  returnDate.setDate(returnDate.getDate() + duration);

  const handleConfirm = async () => {
    await onConfirm(duration);
  };

  const durationOptions = [
    { label: '1 semaine (7 jours)', value: 7 },
    { label: '2 semaines (14 jours)', value: 14 },
    { label: '3 semaines (21 jours)', value: 21 },
    { label: '1 mois (30 jours)', value: 30 },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Confirmer l'emprunt</h3>

        <div style={styles.content}>
          <p><strong>Livre :</strong> {livre.titre}</p>

          <div style={styles.infoBox}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Sélectionnez la durée d'emprunt :</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                style={styles.select}
                disabled={loading}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Date de retour :</span>
              <span style={styles.value}>{formatDate(returnDate)}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Tarif :</span>
              <span style={styles.value}>{borrowPrice}€</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Code de récupération :</span>
              <span style={styles.code}>{pickupCode}</span>
            </div>
          </div>

          <p style={styles.note}>Code à présenter au comptoir pour récupérer votre livre</p>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={onCancel}
            style={styles.cancelBtn}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            style={styles.confirmBtn}
            disabled={loading}
          >
            {loading ? 'En cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
  },
  title: {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    color: '#333',
  },
  content: {
    marginBottom: '1.5rem',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontWeight: '600',
    color: '#555',
    marginBottom: '0.5rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  code: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#2563eb',
    fontFamily: 'monospace',
    backgroundColor: '#e3f2fd',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  note: {
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ddd',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};
