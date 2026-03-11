import { useState, useEffect } from 'react';
import { getAllEmprunts, retourner } from '../../services/emprunts.service';

const statutColor = { en_cours: 'orange', retourne: 'green', en_retard: 'red' };

export default function ManageLoansPage() {
  const [emprunts, setEmprunts] = useState([]);
  const [msg,      setMsg]      = useState('');

  const load = () => getAllEmprunts().then(res => setEmprunts(res.data.data));
  useEffect(() => { load(); }, []);

  const handleRetour = async (id) => {
    await retourner(id);
    setMsg('Retour enregistré.');
    load();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des emprunts</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th>Livre</th><th>Adhérent</th><th>Emprunté le</th>
            <th>Retour prévu</th><th>Statut</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {emprunts.length === 0
            ? <tr><td colSpan={6} style={{ textAlign: 'center' }}>Aucun emprunt.</td></tr>
            : emprunts.map(e => (
              <tr key={e.id_emprunt}>
                <td>{e.titre}</td>
                <td>{e.prenom} {e.nom}</td>
                <td>{e.date_emprunt?.split('T')[0]}</td>
                <td>{e.date_retour_prevue?.split('T')[0]}</td>
                <td style={{ color: statutColor[e.statut] }}>{e.statut}</td>
                <td>
                  {e.statut !== 'retourne' && (
                    <button onClick={() => handleRetour(e.id_emprunt)}>Enregistrer retour</button>
                  )}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
