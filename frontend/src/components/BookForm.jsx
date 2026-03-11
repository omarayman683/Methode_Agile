import { useState } from 'react';

export default function BookForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    titre:            initial.titre            || '',
    auteur:           initial.auteur           || '',
    date_publication: initial.date_publication?.split('T')[0] || '',
    categorie:        initial.categorie        || '',
    resume:           initial.resume           || '',
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input name="titre"            placeholder="Titre *"      value={form.titre}            onChange={set} required />
      <input name="auteur"           placeholder="Auteur *"     value={form.auteur}           onChange={set} required />
      <input name="date_publication" type="date"                value={form.date_publication} onChange={set} />
      <input name="categorie"        placeholder="Catégorie"    value={form.categorie}        onChange={set} />
      <textarea name="resume"        placeholder="Résumé"       value={form.resume}           onChange={set} rows={3} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit">Enregistrer</button>
        {onCancel && <button type="button" onClick={onCancel}>Annuler</button>}
      </div>
    </form>
  );
}
