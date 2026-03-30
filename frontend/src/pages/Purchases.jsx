import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Purchases() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ producto_id: '', proveedor: '', cantidad: 1, costo_unitario: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [purchasesRes, productsRes] = await Promise.all([api.get('/compras'), api.get('/productos')]);
    setRows(purchasesRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createPurchase = async (e) => {
    e.preventDefault();
    await api.post('/compras', {
      producto_id: Number(form.producto_id),
      proveedor: form.proveedor,
      cantidad: Number(form.cantidad),
      costo_unitario: Number(form.costo_unitario)
    });
    setMessage('Compra registrada correctamente.');
    setForm({ producto_id: '', proveedor: '', cantidad: 1, costo_unitario: '' });
    await loadData();
  };

  return (
    <div>
      <h1>Compras</h1>

      <div className="card">
        <h3>Registrar compra</h3>
        <form className="form-grid" onSubmit={createPurchase}>
          <select required value={form.producto_id} onChange={(e) => setForm((p) => ({ ...p, producto_id: e.target.value }))}>
            <option value="">Selecciona producto</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <input required placeholder="Proveedor" value={form.proveedor} onChange={(e) => setForm((p) => ({ ...p, proveedor: e.target.value }))} />
          <input type="number" min="1" required value={form.cantidad} onChange={(e) => setForm((p) => ({ ...p, cantidad: e.target.value }))} />
          <input type="number" min="0" step="0.01" required value={form.costo_unitario} onChange={(e) => setForm((p) => ({ ...p, costo_unitario: e.target.value }))} />
          <button className="btn-primary" type="submit">Guardar compra</button>
        </form>
        {message && <p className="ok">{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Fecha</th><th>Proveedor</th><th>Cantidad</th><th>Costo</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.fecha?.slice(0, 10)}</td>
                <td>{c.proveedor}</td>
                <td>{c.cantidad}</td>
                <td>${Number(c.costo_unitario).toFixed(2)}</td>
                <td>${Number(c.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
