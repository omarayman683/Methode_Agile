import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserCard from '../../components/UserCard';

const emptyForm = { nom: '', prenom: '', email: '', role: 'adherent', mot_de_passe: '' };

export default function ManageUsersPage() {
  const [users,       setUsers]       = useState([]);
  const [msg,         setMsg]         = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form,        setForm]        = useState(emptyForm);

  const load = () => api.get('/utilisateurs').then(res => setUsers(res.data.data));
  useEffect(() => { load(); }, []);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, mot_de_passe: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/utilisateurs/${id}`);
    setMsg('Utilisateur supprimé.');
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      await api.put(`/utilisateurs/${editingUser.id_utilisateur}`, form);
      setMsg('Utilisateur mis à jour.');
    } else {
      await api.post('/utilisateurs', form);
      setMsg('Utilisateur créé.');
    }
    setEditingUser(null);
    setForm(emptyForm);
    load();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des utilisateurs</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}

      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        maxWidth: '380px', padding: '1rem', border: '1px solid #ddd',
        borderRadius: '8px', marginBottom: '2rem',
      }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{editingUser ? 'Modifier' : 'Nouvel utilisateur'}</h3>
        <input name="prenom"       placeholder="Prénom *"      value={form.prenom}       onChange={set} required />
        <input name="nom"          placeholder="Nom *"         value={form.nom}          onChange={set} required />
        <input name="email" type="email" placeholder="Email *" value={form.email}        onChange={set} required />
        {!editingUser && (
          <input name="mot_de_passe" type="password" placeholder="Mot de passe *"
            value={form.mot_de_passe} onChange={set} required />
        )}
        <select name="role" value={form.role} onChange={set}>
          <option value="adherent">Adhérent</option>
          <option value="bibliothecaire">Bibliothécaire</option>
          <option value="administrateur">Administrateur</option>
        </select>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit">{editingUser ? 'Mettre à jour' : 'Créer'}</button>
          {editingUser && <button type="button" onClick={() => { setEditingUser(null); setForm(emptyForm); }}>Annuler</button>}
        </div>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {users.map(u => (
          <UserCard key={u.id_utilisateur} user={u} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
