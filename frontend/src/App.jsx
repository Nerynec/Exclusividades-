import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Cash from './pages/Cash';
import Users from './pages/Users';

function Protected({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/productos" element={<Protected><Products /></Protected>} />
      <Route path="/inventario" element={<Protected><Inventory /></Protected>} />
      <Route path="/ventas" element={<Protected><Sales /></Protected>} />
      <Route path="/compras" element={<Protected><Purchases /></Protected>} />
      <Route path="/caja" element={<Protected><Cash /></Protected>} />
      <Route path="/usuarios" element={<Protected><Users /></Protected>} />
    </Routes>
  );
}
