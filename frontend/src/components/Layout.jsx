import { NavLink, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const darkMode = localStorage.getItem('theme') === 'dark';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleTheme = () => {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = next;
    localStorage.setItem('theme', next);
  };

  if (!document.body.dataset.theme) {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
  }

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="brand">
          <h2>Exclusividades</h2>
          <p>{currentUser.rol || 'usuario'}</p>
        </div>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/inventario">Inventario</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
          <NavLink to="/compras">Compras</NavLink>
          <NavLink to="/caja">Caja</NavLink>
          <NavLink to="/usuarios">Usuarios</NavLink>
        </nav>
        <button className="btn-secondary" onClick={toggleTheme}>🌙 Modo oscuro</button>
        <a className="btn-primary btn-link" href="http://localhost:4000/api/reportes/ventas.pdf" target="_blank" rel="noreferrer">🧾 Descargar PDF</a>
        <button className="btn-danger" onClick={logout}>Cerrar sesión</button>
      </aside>
      <main>{children}</main>
    </div>
  );
}
