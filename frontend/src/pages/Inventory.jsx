import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Inventory() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/inventario').then((r) => setItems(r.data));
  }, []);

  return (
    <div className="card">
      <h1>Inventario</h1>
      <ul>
        {items.map((p) => (
          <li key={p.id}>{p.nombre} ({p.categoria}) - Stock: {p.stock} - Estado: {p.estado_stock}</li>
        ))}
      </ul>
    </div>
  );
}
