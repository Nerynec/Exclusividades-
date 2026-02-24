import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Purchases() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/compras').then((r) => setRows(r.data));
  }, []);

  return (
    <div className="card">
      <h1>Compras</h1>
      <table>
        <thead><tr><th>Fecha</th><th>Proveedor</th><th>Cantidad</th><th>Costo</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}><td>{c.fecha?.slice(0, 10)}</td><td>{c.proveedor}</td><td>{c.cantidad}</td><td>${c.costo_unitario}</td><td>${c.total}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
