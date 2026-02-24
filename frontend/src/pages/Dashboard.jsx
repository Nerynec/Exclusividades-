import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState({ topProducts: [], salesByMonth: [], salesByDay: [] });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    const { data } = await api.get('/dashboard', { params: { from, to } });
    setData(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Dashboard de Ventas</h1>
      <div className="filters card">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={load}>Filtrar</button>
      </div>

      <section className="grid-2">
        <div className="card">
          <h3>Productos más vendidos</h3>
          <ul>
            {data.topProducts.map((p, i) => (
              <li key={i}>{p.nombre} - {p.total_vendido} uds</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Ventas por mes</h3>
          <ul>
            {data.salesByMonth.map((m, i) => (
              <li key={i}>{m.periodo}: ${m.total}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="card">
        <h3>Ventas por día</h3>
        <ul>
          {data.salesByDay.map((d, i) => (
            <li key={i}>{d.fecha?.slice(0, 10)}: ${d.total}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
