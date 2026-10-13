import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ErrorBanner, Notice, Pagination } from '../components/Components.jsx';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 };

function Cover({ book }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    let created = null;
    if (book.cover_key) {
      api.coverUrl(book.id).then((u) => {
        created = u;
        if (active) setUrl(u);
      });
    } else setUrl(null);
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [book.id, book.cover_key]);
  return url ? <img className="cover" src={url} alt={`Portada de ${book.title}`} /> : <span className="cover empty">Sin portada</span>;
}

export default function BooksPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: '', category_id: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, size: 10 });
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setResult(await api.books({ ...filters, page, size: 10 }));
    } catch (e) {
      setError(e);
    }
  }, [filters, page]);

  useEffect(() => {
    api.categories().then((d) => setCategories(d.items)).catch(setError);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function run(action, message) {
    setError(null);
    setNotice('');
    try {
      await action();
      setNotice(message);
      await load();
      return true;
    } catch (e) {
      setError(e);
      return false;
    }
  }

  async function save(event) {
    event.preventDefault();
    const data = { ...form, total_copies: Number(form.total_copies) };
    const ok = editing
      ? await run(() => api.updateBook(editing, { title: data.title, author: data.author, category_id: data.category_id, total_copies: data.total_copies }), 'Libro actualizado.')
      : await run(() => api.createBook(data), 'Libro creado.');
    if (ok) {
      setForm(EMPTY);
      setEditing(null);
    }
  }

  function edit(book) {
    setEditing(book.id);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, category_id: book.category.id, total_copies: book.total_copies });
  }

  return (
    <section>
      <h2>Catálogo</h2>
      <ErrorBanner error={error} />
      <Notice>{notice}</Notice>

      <div className="filters">
        <input
          placeholder="Buscar por título o autor"
          value={filters.q}
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, q: e.target.value });
          }}
        />
        <select
          value={filters.category_id}
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, category_id: e.target.value });
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Portada</th>
            <th>Título</th>
            <th>Autor</th>
            <th>ISBN</th>
            <th>Categoría</th>
            <th>Disponibles</th>
            {isAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {result.items.map((book) => (
            <tr key={book.id}>
              <td>
                <Cover book={book} />
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.category.name}</td>
              <td>
                {book.available_copies} / {book.total_copies}
              </td>
              {isAdmin && (
                <td className="actions">
                  <button onClick={() => edit(book)}>Editar</button>
                  <button onClick={() => window.confirm(`¿Dar de baja «${book.title}»?`) && run(() => api.deleteBook(book.id), 'Libro dado de baja.')}>
                    Dar de baja
                  </button>
                  <label className="file">
                    Portada
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => e.target.files[0] && run(() => api.uploadCover(book.id, e.target.files[0]), 'Portada guardada.')}
                    />
                  </label>
                  {book.cover_key && <button onClick={() => run(() => api.removeCover(book.id), 'Portada eliminada.')}>Quitar portada</button>}
                </td>
              )}
            </tr>
          ))}
          {result.items.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 7 : 6}>No hay libros que coincidan.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} size={result.size ?? 10} total={result.total} onChange={setPage} />

      {isAdmin && (
        <form onSubmit={save} className="card">
          <h3>{editing ? 'Editar libro' : 'Nuevo libro'}</h3>
          <label>
            Título
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Autor
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </label>
          <label>
            ISBN (13 dígitos)
            <input value={form.isbn} disabled={Boolean(editing)} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
          </label>
          <label>
            Categoría
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Seleccione…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Total de ejemplares
            <input type="number" min="1" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: e.target.value })} required />
          </label>
          <div className="row">
            <button type="submit">{editing ? 'Guardar cambios' : 'Crear libro'}</button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(EMPTY);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
