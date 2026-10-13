import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, formatDate, Notice, Pagination, STATUS_LABEL } from '../components/Components.jsx';

export default function LoansPage() {
  const [filters, setFilters] = useState({ from: '', to: '', status: '', member_id: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, size: 10 });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setResult(await api.loans({ ...filters, page, size: 10 }));
    } catch (e) {
      setError(e);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  function change(name, value) {
    setError(null);
    setPage(1);
    setFilters({ ...filters, [name]: value });
  }

  async function giveBack(loanId, itemId) {
    setError(null);
    setNotice('');
    try {
      await api.returnItem(loanId, itemId);
      setNotice('Devolución registrada.');
      await load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <section>
      <h2>Préstamos</h2>
      <ErrorBanner error={error} />
      <Notice>{notice}</Notice>
      <div className="filters">
        <label>
          Desde
          <input type="date" value={filters.from} onChange={(e) => change('from', e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={filters.to} onChange={(e) => change('to', e.target.value)} />
        </label>
        <label>
          Estado
          <select value={filters.status} onChange={(e) => change('status', e.target.value)}>
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="overdue">Vencido</option>
            <option value="closed">Cerrado</option>
          </select>
        </label>
        <label>
          Id del socio
          <input value={filters.member_id} onChange={(e) => change('member_id', e.target.value.trim())} placeholder="UUID del socio" />
        </label>
      </div>

      {result.items.map((loan) => (
        <article key={loan.id} className="card">
          <header className="row">
            <strong>{formatDate(loan.loaned_at)}</strong>
            <span className={`badge ${loan.status}`}>{STATUS_LABEL[loan.status]}</span>
          </header>
          <table>
            <thead>
              <tr>
                <th>Libro</th>
                <th>Vence</th>
                <th>Devuelto</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loan.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.book_title}</td>
                  <td>{formatDate(item.due_at)}</td>
                  <td>{formatDate(item.returned_at)}</td>
                  <td>{!item.returned_at && <button onClick={() => giveBack(loan.id, item.id)}>Devolver</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}
      {result.items.length === 0 && <p>No hay préstamos para esos filtros.</p>}
      <Pagination page={page} size={result.size ?? 10} total={result.total} onChange={setPage} />
    </section>
  );
}
