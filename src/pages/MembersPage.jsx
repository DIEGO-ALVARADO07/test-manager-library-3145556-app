import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Notice, Pagination } from '../components/Components.jsx';

export default function MembersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, size: 10 });
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setResult(await api.members({ q, page, size: 10 }));
    } catch (e) {
      setError(e);
    }
  }, [q, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(event) {
    event.preventDefault();
    setError(null);
    setNotice('');
    try {
      await api.createMember(form);
      setForm({ full_name: '', document_number: '' });
      setNotice('Socio creado.');
      await load();
    } catch (e) {
      setError(e);
    }
  }

  async function show(id) {
    setError(null);
    try {
      setDetail(await api.member(id));
    } catch (e) {
      setError(e);
    }
  }

  return (
    <section>
      <h2>Socios</h2>
      <ErrorBanner error={error} />
      <Notice>{notice}</Notice>
      <div className="filters">
        <input
          placeholder="Buscar por nombre o documento"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {result.items.map((m) => (
            <tr key={m.id}>
              <td>{m.full_name}</td>
              <td>{m.document_number}</td>
              <td>
                <button onClick={() => show(m.id)}>Ver detalle</button>
              </td>
            </tr>
          ))}
          {result.items.length === 0 && (
            <tr>
              <td colSpan="3">No hay socios que coincidan.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} size={result.size ?? 10} total={result.total} onChange={setPage} />

      {detail && (
        <div className="card">
          <h3>{detail.full_name}</h3>
          <p>Documento: {detail.document_number}</p>
          <p>Libros sin devolver: {detail.active_loans}</p>
          <button onClick={() => setDetail(null)}>Cerrar</button>
        </div>
      )}

      <form onSubmit={create} className="card">
        <h3>Nuevo socio</h3>
        <label>
          Nombre completo
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </label>
        <label>
          Documento
          <input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required />
        </label>
        <button type="submit">Crear socio</button>
      </form>
    </section>
  );
}
