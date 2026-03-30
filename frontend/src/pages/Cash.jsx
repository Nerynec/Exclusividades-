import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Cash() {
  const [movs, setMovs] = useState([]);
  const [balance, setBalance] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [form, setForm] = useState({ tipo: 'ingreso', monto: '', descripcion: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [movRes, balRes] = await Promise.all([api.get('/caja/movimientos'), api.get('/caja/balance')]);
    setMovs(movRes.data);
    setBalance(balRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createMovement = async (e) => {
    e.preventDefault();
    await api.post('/caja/movimientos', {
      tipo: form.tipo,
      monto: Number(form.monto),
      descripcion: form.descripcion
    });
    setMessage('Movimiento registrado correctamente.');
    setForm({ tipo: 'ingreso', monto: '', descripcion: '' });
    await loadData();
  };

  return (
    <div>
      <h1>Caja</h1>

      <div className="grid-3">
        <div className="card stat-card">Ingresos: <strong>${Number(balance.ingresos || 0).toFixed(2)}</strong></div>
        <div className="card stat-card">Egresos: <strong>${Number(balance.egresos || 0).toFixed(2)}</strong></div>
        <div className="card stat-card">Balance: <strong>${Number(balance.balance || 0).toFixed(2)}</strong></div>
      </div>

      <div className="card">
        <h3>Registrar movimiento manual</h3>
        <form className="form-grid" onSubmit={createMovement}>
          <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
          <input type="number" min="0" step="0.01" required value={form.monto} onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))} placeholder="Monto" />
          <input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción" />
          <button className="btn-primary" type="submit">Guardar movimiento</button>
        </form>
        {message && <p className="ok">{message}</p>}
      </div>

      <div className="card">
        <h3>Movimientos</h3>
        <table>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Descripción</th></tr></thead>
          <tbody>
            {movs.map((m) => (
              <tr key={m.id}>
                <td>{m.fecha?.slice(0, 10)}</td>
                <td>{m.tipo}</td>
                <td>${Number(m.monto).toFixed(2)}</td>
                <td>{m.descripcion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
