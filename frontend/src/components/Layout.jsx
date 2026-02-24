import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Exclusividades</h2>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/inventario">Inventario</Link>
          <Link to="/ventas">Ventas</Link>
          <Link to="/compras">Compras</Link>
          <Link to="/caja">Caja</Link>
        </nav>
        <button onClick={logout}>Cerrar sesión</button>
      </aside>
      <main>{children}</main>
    </div>
  );
}
