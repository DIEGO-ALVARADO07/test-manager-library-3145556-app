import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorBanner, Notice } from '../components/Components.jsx';

export default function UsersPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setNotice('');
    try {
      const user = await api.createLibrarian(form.username, form.password);
      setNotice(`Bibliotecario «${user.username}» creado.`);
      setForm({ username: '', password: '' });
    } catch (e) {
      setError(e);
    }
  }

  return (
    <section>
      <h2>Bibliotecarios</h2>
      <ErrorBanner error={error} />
      <Notice>{notice}</Notice>
      <form onSubmit={submit} className="card">
        <h3>Nuevo bibliotecario</h3>
        <label>
          Usuario
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button type="submit">Crear bibliotecario</button>
      </form>
    </section>
  );
}
