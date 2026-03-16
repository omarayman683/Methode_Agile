import { useState, useEffect } from 'react';
import { getMesEmprunts } from '../../services/emprunts.service';
import api from '../../services/api';

const statutColor = { en_cours: 'orange', retourne: 'green', en_retard: 'red' };

export default function HistoryPage() {
  const [emprunts, setEmprunts] = useState([]);
  const [amendes,  setAmendes]  = useState([]);

  useEffect(() => {
    getMesEmprunts().then(res => setEmprunts(res.data.data));
    api.get('/amendes/mes-amendes').then(res => setAmendes(res.data.data));
  }, []);

  return (
    <div style={{ padding: '2rem', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <h2>Mes emprunts</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '2rem' }}>
        <thead style={{ background: 'var(--table-head)' }}>
          <tr>
            <th>Titre</th><th>Emprunté le</th><th>Retour prévu</th><th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {emprunts.length === 0
            ? <tr><td colSpan={4} style={{ textAlign: 'center' }}>Aucun emprunt.</td></tr>
            : emprunts.map(e => (
              <tr key={e.id_emprunt}>
                <td>{e.titre}</td>
                <td>{e.date_emprunt?.split('T')[0]}</td>
                <td>{e.date_retour_prevue?.split('T')[0]}</td>
                <td style={{ color: statutColor[e.statut] }}>{e.statut}</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      <h2>Mes amendes</h2>
      {amendes.length === 0 ? (
        <p>Aucune amende.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ background: 'var(--table-head)' }}>
            <tr><th>Livre</th><th>Montant</th><th>Payée</th></tr>
          </thead>
          <tbody>
            {amendes.map(a => (
              <tr key={a.id_amende}>
                <td>{a.titre}</td>
                <td>{a.montant} €</td>
                <td style={{ color: a.payee ? 'green' : 'red' }}>{a.payee ? 'Oui' : 'Non'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
