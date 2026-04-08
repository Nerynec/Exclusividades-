import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// ✅ OPCIONES PRO PARA GRÁFICAS
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#374151',
        font: { size: 12 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#6B7280' },
      grid: { display: false }
    },
    y: {
      ticks: { color: '#6B7280' },
      grid: { color: '#E5E7EB' }
    }
  }
};

export default function Dashboard() {
  const [data, setData] = useState({
    topProducts: [],
    salesByMonth: [],
    salesByDay: []
  });

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    const res = await api.get('/dashboard', { params: { from, to } });
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  // 📊 KPIs
  const totalVentas = data.salesByDay.reduce((acc, d) => acc + Number(d.total || 0), 0);
  const totalProductos = data.topProducts.length;
  const mejorProducto = data.topProducts[0]?.nombre || 'N/A';

  // 📊 Charts
  const topProductsChart = {
    labels: data.topProducts.map(p => p.nombre),
    datasets: [{
      data: data.topProducts.map(p => p.total_vendido),
      backgroundColor: ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9']
    }]
  };

  const salesByMonthChart = {
    labels: data.salesByMonth.map(m => m.periodo),
    datasets: [{
      label: 'Ventas',
      data: data.salesByMonth.map(m => m.total),
      backgroundColor: '#6366F1'
    }]
  };

  const salesByDayChart = {
    labels: data.salesByDay.map(d => d.fecha?.slice(0, 10)),
    datasets: [{
      label: 'Ventas',
      data: data.salesByDay.map(d => d.total),
      borderColor: '#22C55E',
      tension: 0.4
    }]
  };

  return (
    <div className="dashboard">

      <h1>Control de Ventas - Exclusivos Glorita</h1>

      {/* 🔥 KPIs */}
      <div className="kpis">
        <div className="card kpi">
          <h4>Total Ventas</h4>
          <p>Q {totalVentas}</p>
        </div>

        <div className="card kpi">
          <h4>Productos vendidos</h4>
          <p>{totalProductos}</p>
        </div>

        <div className="card kpi">
          <h4>Top producto</h4>
          <p>{mejorProducto}</p>
        </div>
      </div>

      {/* 🎛️ Filtros */}
      <div className="card filters">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={load}>Filtrar</button>
      </div>

      {/* 📊 Gráficas */}
      <div className="grid">
        
        <div className="card">
          <h3>🔥 Productos más vendidos</h3>
          <div className="chart-container">
            <Doughnut data={topProductsChart} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3>📅 Ventas por mes</h3>
          <div className="chart-container">
            <Bar data={salesByMonthChart} options={chartOptions} />
          </div>
        </div>

      </div>

      <div className="card">
        <h3>📈 Ventas por día</h3>
        <div className="chart-container">
          <Line data={salesByDayChart} options={chartOptions} />
        </div>
      </div>

    </div>
  );
}