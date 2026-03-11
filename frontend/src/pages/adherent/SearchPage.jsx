import { useState, useEffect } from 'react';
import { getLivres } from '../../services/livres.service';
import { searchSimple, searchAI } from '../../services/search.service';
import BookCard from '../../components/BookCard';

export default function SearchPage() {
  const [livres,  setLivres]  = useState([]);
  const [query,   setQuery]   = useState('');
  const [aiMode,  setAiMode]  = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLivres().then(res => setLivres(res.data.data));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      getLivres().then(res => setLivres(res.data.data));
      return;
    }
    setLoading(true);
    try {
      const res = aiMode ? await searchAI(query) : await searchSimple(query);
      setLivres(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Catalogue</h2>
      <form onSubmit={handleSearch}
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par titre, auteur, catégorie…"
          style={{ flex: 1, minWidth: '220px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={aiMode} onChange={e => setAiMode(e.target.checked)} />
          Recherche IA
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Recherche…' : 'Rechercher'}</button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {livres.length === 0
          ? <p>Aucun résultat.</p>
          : livres.map(l => <BookCard key={l.id_livre} livre={l} />)
        }
      </div>
    </div>
  );
}
