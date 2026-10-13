import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner } from '../components/Components.jsx';

export default function ReportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [range, setRange] = useState({ from: today.slice(0, 8) + '01', to: today });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  async function run(event) {
    event.preventDefault();
    setError(null);
    try {
      setRows((await api.mostBorrowed(range.from, range.to)).rows);
    } catch (e) {
      setRows(null);
      setError(e);
    }
  }

  return (
    <section>
      <h2>Libros más prestados</h2>
      <ErrorBanner error={error} />
      <form onSubmit={run} className="filters">
        <label>
          Desde
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} required />
        </label>
        <label>
          Hasta
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} required />
        </label>
        <button type="submit">Generar reporte</button>
      </form>
      {rows && (
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Categoría</th>
              <th>Veces prestado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.book_id}-${r.book_title}-${r.category_name}`}>
                <td>{r.book_title}</td>
                <td>{r.category_name}</td>
                <td>{r.times_borrowed}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="3">No hubo préstamos en ese rango.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
