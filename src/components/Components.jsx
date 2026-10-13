import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

/** Shows the API error in Spanish: message plus the field details when there are any. */
export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="banner banner-error" role="alert">
      <strong>{error.message}</strong>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((d, i) => (
            <li key={i}>
              {d.field}: {d.issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Notice({ children }) {
  if (!children) return null;
  return (
    <div className="banner banner-ok" role="status">
      {children}
    </div>
  );
}

export function Pagination({ page, size, total, onChange }) {
  const pages = Math.max(Math.ceil(total / size), 1);
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages} · {total} resultados
      </span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Siguiente
      </button>
    </div>
  );
}

/** Only renders its children for the allowed roles (the API still enforces them). */
export function RoleGuard({ roles }) {
  const { session, role } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function Layout() {
  const { role, logout } = useAuth();
  const link = ({ isActive }) => (isActive ? 'active' : undefined);
  return (
    <>
      <header className="topbar">
        <strong>Manager Library</strong>
        <nav>
          <NavLink to="/books" className={link}>
            Catálogo
          </NavLink>
          <NavLink to="/members" className={link}>
            Socios
          </NavLink>
          <NavLink to="/loans/new" className={link}>
            Prestar
          </NavLink>
          <NavLink to="/loans" end className={link}>
            Préstamos
          </NavLink>
          <NavLink to="/overdue" className={link}>
            Vencidos
          </NavLink>
          {role === 'admin' && (
            <>
              <NavLink to="/report" className={link}>
                Reporte
              </NavLink>
              <NavLink to="/users" className={link}>
                Bibliotecarios
              </NavLink>
            </>
          )}
        </nav>
        <span className="who">
          {role === 'admin' ? 'Administrador' : 'Bibliotecario'}
          <button onClick={logout}>Salir</button>
        </span>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export const STATUS_LABEL = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' };
