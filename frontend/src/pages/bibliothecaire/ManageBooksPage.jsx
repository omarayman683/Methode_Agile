import { useState, useEffect } from 'react';
import { getLivres, createLivre, updateLivre, deleteLivre } from '../../services/livres.service';
import BookCard from '../../components/BookCard';
import BookForm from '../../components/BookForm';

export default function ManageBooksPage() {
  const [livres,  setLivres]  = useState([]);
  const [editing, setEditing] = useState(null); // null = hidden | {} = new | livre = edit
  const [msg,     setMsg]     = useState('');

  const load = () => getLivres().then(res => setLivres(res.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    if (editing?.id_livre) {
      await updateLivre(editing.id_livre, data);
      setMsg('Livre mis à jour.');
    } else {
      await createLivre(data);
      setMsg('Livre ajouté.');
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    await deleteLivre(id);
    setMsg('Livre supprimé.');
    load();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des livres</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <button onClick={() => setEditing({})}>+ Ajouter un livre</button>

      {editing !== null && (
        <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #aaa', borderRadius: '8px', maxWidth: '400px' }}>
          <h3>{editing.id_livre ? 'Modifier le livre' : 'Nouveau livre'}</h3>
          <BookForm initial={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
        {livres.map(l => (
          <div key={l.id_livre}>
            <BookCard livre={l} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setEditing(l)}>Modifier</button>
              <button onClick={() => handleDelete(l.id_livre)} style={{ color: 'red' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
