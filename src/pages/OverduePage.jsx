import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, formatDate, Pagination } from '../components/Components.jsx';

export default function OverduePage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, size: 20 });
  const [error, setError] = useState(null);

  useEffect(() => {
    api.overdue({ page, size: 20 }).then(setResult).catch(setError);
  }, [page]);

  return (
    <section>
      <h2>Libros vencidos</h2>
      <ErrorBanner error={error} />
      <table>
        <thead>
          <tr>
            <th>Libro</th>
            <th>Socio</th>
            <th>Vencía</th>
            <th>Días de retraso</th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((row) => (
            <tr key={row.item_id}>
              <td>{row.book_title}</td>
              <td>{row.member_name}</td>
              <td>{formatDate(row.due_at)}</td>
              <td>{row.days_late}</td>
            </tr>
          ))}
          {result.items.length === 0 && (
            <tr>
              <td colSpan="4">No hay libros vencidos.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} size={result.size ?? 20} total={result.total} onChange={setPage} />
    </section>
  );
}
