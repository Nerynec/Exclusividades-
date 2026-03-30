import { NavLink, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="brand">
          <h2>Exclusividades</h2>
          <p>Panel de administración</p>
        </div>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/inventario">Inventario</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
          <NavLink to="/compras">Compras</NavLink>
          <NavLink to="/caja">Caja</NavLink>
        </nav>
        <button className="btn-danger" onClick={logout}>Cerrar sesión</button>
      </aside>
      <main>{children}</main>
    </div>
  );
}
