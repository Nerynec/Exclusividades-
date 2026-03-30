import { useEffect, useState } from 'react';
import api from '../api/client';

const emptyForm = { nombre: '', categoria: 'Ropa', precio: '', stock: '' };

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadProducts = async () => {
    const { data } = await api.get('/productos');
    setItems(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock) };

    if (editingId) {
      await api.put(`/productos/${editingId}`, payload);
      setMessage('Producto actualizado correctamente.');
    } else {
      await api.post('/productos', payload);
      setMessage('Producto creado correctamente.');
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: String(product.precio),
      stock: String(product.stock)
    });
  };

  const removeProduct = async (id) => {
    if (!window.confirm('¿Deseas eliminar este producto?')) return;
    await api.delete(`/productos/${id}`);
    setMessage('Producto eliminado correctamente.');
    await loadProducts();
  };

  return (
    <div>
      <h1>Gestión de Productos</h1>

      <div className="card">
        <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            placeholder="Nombre del producto"
            required
          />
          <select
            value={form.categoria}
            onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
          >
            <option>Ropa</option>
            <option>Botas</option>
            <option>Sombreros</option>
            <option>Cinchos</option>
            <option>Accesorios</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
            placeholder="Precio"
            required
          />
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
            placeholder="Stock"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
        {message && <p className="ok">{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>${Number(p.precio).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td className="actions-cell">
                  <button className="btn-secondary" onClick={() => startEdit(p)}>Editar</button>
                  <button className="btn-danger" onClick={() => removeProduct(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
