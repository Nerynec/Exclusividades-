import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

export default function Dashboard() {
  const [data, setData] = useState({ topProducts: [], salesByMonth: [], salesByDay: [] });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [liveSales, setLiveSales] = useState([]);

  const load = async () => {
    const { data } = await api.get('/dashboard', { params: { from, to } });
    setData(data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket'] });

    socket.on('sale:created', (sale) => {
      setLiveSales((prev) => [sale, ...prev].slice(0, 8));
      load();
    });

    return () => socket.disconnect();
  }, []);

  const maxMonth = useMemo(() => Math.max(1, ...data.salesByMonth.map((i) => Number(i.total))), [data.salesByMonth]);

  return (
    <div>
      <h1>Dashboard de Ventas (Tiempo Real)</h1>
      <div className="filters card">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn-primary" onClick={load}>Filtrar</button>
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
          <h3>Ventas por mes (gráfico)</h3>
          <div className="chart-list">
            {data.salesByMonth.map((m, i) => (
              <div className="chart-row" key={i}>
                <span>{m.periodo}</span>
                <div className="bar-wrap"><div className="bar" style={{ width: `${(Number(m.total) / maxMonth) * 100}%` }} /></div>
                <strong>${Number(m.total).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid-2">
        <div className="card">
          <h3>Ventas por día</h3>
          <ul>
            {data.salesByDay.map((d, i) => (
              <li key={i}>{d.fecha?.slice(0, 10)}: ${Number(d.total).toFixed(2)}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Ventas en vivo</h3>
          <ul>
            {liveSales.length === 0 && <li>Sin eventos aún...</li>}
            {liveSales.map((s, idx) => (
              <li key={idx}>#{s.ventaId} - ${Number(s.total).toFixed(2)} - {s.fecha?.slice(0, 19).replace('T', ' ')}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
