import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, formatDate, Notice } from '../components/Components.jsx';

export default function NewLoanPage() {
  const [memberQuery, setMemberQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
  const [bookQuery, setBookQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (!memberQuery.trim()) return setMembers([]);
    api.members({ q: memberQuery, size: 5 }).then((d) => setMembers(d.items)).catch(setError);
  }, [memberQuery]);

  useEffect(() => {
    if (!bookQuery.trim()) return setBooks([]);
    api.books({ q: bookQuery, size: 5 }).then((d) => setBooks(d.items)).catch(setError);
  }, [bookQuery]);

  function addBook(book) {
    if (selected.some((b) => b.id === book.id) || selected.length >= 3) return;
    setSelected([...selected, book]);
  }

  async function submit() {
    setError(null);
    setCreated(null);
    try {
      const loan = await api.createLoan(member.id, selected.map((b) => b.id));
      setCreated(loan);
      setSelected([]);
      setBooks([]);
      setBookQuery('');
    } catch (e) {
      setError(e);
    }
  }

  return (
    <section>
      <h2>Registrar préstamo</h2>
      <ErrorBanner error={error} />
      {created && (
        <Notice>
          Préstamo registrado. Vence el {formatDate(created.items[0]?.due_at)} ({created.items.length} libro(s)).
        </Notice>
      )}

      <div className="card">
        <h3>1. Socio</h3>
        {member ? (
          <p>
            <strong>{member.full_name}</strong> · {member.document_number}{' '}
            <button onClick={() => setMember(null)}>Cambiar</button>
          </p>
        ) : (
          <>
            <input placeholder="Buscar socio por nombre o documento" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
            <ul className="pick">
              {members.map((m) => (
                <li key={m.id}>
                  <button onClick={() => setMember(m)}>
                    {m.full_name} · {m.document_number}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card">
        <h3>2. Libros (de 1 a 3)</h3>
        <input placeholder="Buscar libro por título o autor" value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} />
        <ul className="pick">
          {books.map((b) => (
            <li key={b.id}>
              <button disabled={b.available_copies < 1 || selected.length >= 3} onClick={() => addBook(b)}>
                {b.title} — {b.author} ({b.available_copies} disponibles)
              </button>
            </li>
          ))}
        </ul>
        <h4>Seleccionados</h4>
        <ul>
          {selected.map((b) => (
            <li key={b.id}>
              {b.title} <button onClick={() => setSelected(selected.filter((x) => x.id !== b.id))}>Quitar</button>
            </li>
          ))}
          {selected.length === 0 && <li>Ninguno todavía.</li>}
        </ul>
      </div>

      <button disabled={!member || selected.length === 0} onClick={submit}>
        Registrar préstamo
      </button>
    </section>
  );
}
