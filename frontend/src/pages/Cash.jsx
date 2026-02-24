import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Cash() {
  const [movs, setMovs] = useState([]);
  const [balance, setBalance] = useState({ ingresos: 0, egresos: 0, balance: 0 });

  useEffect(() => {
    api.get('/caja/movimientos').then((r) => setMovs(r.data));
    api.get('/caja/balance').then((r) => setBalance(r.data));
  }, []);

  return (
    <div>
      <h1>Caja</h1>
      <div className="grid-3">
        <div className="card">Ingresos: ${balance.ingresos || 0}</div>
        <div className="card">Egresos: ${balance.egresos || 0}</div>
        <div className="card">Balance: ${balance.balance || 0}</div>
      </div>
      <div className="card">
        <h3>Movimientos</h3>
        <ul>
          {movs.map((m) => (
            <li key={m.id}>{m.fecha?.slice(0, 10)} - {m.tipo} - ${m.monto} - {m.descripcion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
