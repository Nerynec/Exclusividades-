import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Sales() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/ventas').then((r) => setRows(r.data));
  }, []);

  return (
    <div className="card">
      <h1>Ventas</h1>
      <table>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>P.Unitario</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map((v) => (
            <tr key={`${v.id}-${v.producto}`}>
              <td>{v.fecha?.slice(0, 10)}</td>
              <td>{v.producto}</td>
              <td>{v.cantidad}</td>
              <td>${v.precio_unitario}</td>
              <td>${v.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
