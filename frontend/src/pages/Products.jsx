import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Products() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/productos').then((r) => setItems(r.data));
  }, []);

  return (
    <div className="card">
      <h1>Productos</h1>
      <table>
        <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}><td>{p.nombre}</td><td>{p.categoria}</td><td>${p.precio}</td><td>{p.stock}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
