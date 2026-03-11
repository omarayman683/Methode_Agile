export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <div style={{
      border: '1px solid #ddd', padding: '1rem', borderRadius: '8px',
      width: '210px', display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <h3 style={{ margin: 0 }}>{user.prenom} {user.nom}</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{user.email}</p>
      <p style={{ margin: '0.25rem 0' }}><strong>{user.role}</strong></p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button onClick={() => onEdit(user)}>Modifier</button>
        <button onClick={() => onDelete(user.id_utilisateur)} style={{ color: 'red' }}>Supprimer</button>
      </div>
    </div>
  );
}
