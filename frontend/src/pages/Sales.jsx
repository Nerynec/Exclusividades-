import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

export default function Sales() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ producto_id: '', cantidad: 1, precio_unitario: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [salesRes, productsRes] = await Promise.all([api.get('/ventas'), api.get('/productos')]);
    setRows(salesRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => Number(p.id) === Number(form.producto_id)),
    [products, form.producto_id]
  );

  useEffect(() => {
    if (selectedProduct) {
      setForm((prev) => ({ ...prev, precio_unitario: String(selectedProduct.precio) }));
    }
  }, [selectedProduct]);

  const createSale = async (e) => {
    e.preventDefault();
    await api.post('/ventas', {
      items: [{
        producto_id: Number(form.producto_id),
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario)
      }]
    });
    setMessage('Venta registrada correctamente.');
    setForm({ producto_id: '', cantidad: 1, precio_unitario: '' });
    await loadData();
  };

  return (
    <div>
      <h1>Ventas</h1>

      <div className="card">
        <h3>Registrar venta</h3>
        <form className="form-grid" onSubmit={createSale}>
          <select required value={form.producto_id} onChange={(e) => setForm((p) => ({ ...p, producto_id: e.target.value }))}>
            <option value="">Selecciona producto</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nombre} (Stock {p.stock})</option>)}
          </select>
          <input type="number" min="1" value={form.cantidad} onChange={(e) => setForm((p) => ({ ...p, cantidad: e.target.value }))} required />
          <input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={(e) => setForm((p) => ({ ...p, precio_unitario: e.target.value }))} required />
          <button type="submit" className="btn-primary">Guardar venta</button>
        </form>
        {message && <p className="ok">{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>P.Unitario</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((v) => (
              <tr key={`${v.id}-${v.producto}-${v.cantidad}`}>
                <td>{v.fecha?.slice(0, 10)}</td>
                <td>{v.producto}</td>
                <td>{v.cantidad}</td>
                <td>${Number(v.precio_unitario).toFixed(2)}</td>
                <td>${Number(v.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
