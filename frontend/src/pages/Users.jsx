import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [message, setMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const loadUsers = async () => {
    const { data } = await api.get('/usuarios');
    setUsers(data);
  };

  useEffect(() => {
    if (currentUser.rol === 'admin') loadUsers();
  }, []);

  if (currentUser.rol !== 'admin') {
    return <div className="card"><h1>Usuarios</h1><p>Solo un administrador puede gestionar usuarios.</p></div>;
  }

  const createUser = async (e) => {
    e.preventDefault();
    await api.post('/usuarios', form);
    setMessage('Usuario creado correctamente.');
    setForm({ nombre: '', email: '', password: '', rol: 'vendedor' });
    await loadUsers();
  };

  const changeRole = async (id, rol) => {
    await api.put(`/usuarios/${id}/rol`, { rol });
    setMessage('Rol actualizado.');
    await loadUsers();
  };

  return (
    <div>
      <h1>Usuarios y Roles</h1>
      <div className="card">
        <h3>Crear usuario</h3>
        <form className="form-grid" onSubmit={createUser}>
          <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <input required type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          <select value={form.rol} onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))}>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn-primary">Guardar usuario</button>
        </form>
        {message && <p className="ok">{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td className="actions-cell">
                  <button className="btn-secondary" onClick={() => changeRole(u.id, 'vendedor')}>Hacer vendedor</button>
                  <button className="btn-primary" onClick={() => changeRole(u.id, 'admin')}>Hacer admin</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
