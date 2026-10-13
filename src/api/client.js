// HTTP client for the API (api-contract.md). Adds the Bearer token and turns the
// single error body {code, message, details} into an ApiError the UI can show in Spanish.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

let tokenProvider = () => null;
let unauthorizedHandler = () => {};

export function configureClient({ getToken, onUnauthorized }) {
  tokenProvider = getToken;
  unauthorizedHandler = onUnauthorized;
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'No se pudo completar la operación.');
    this.status = status;
    this.code = body?.code ?? 'UNKNOWN';
    this.details = Array.isArray(body?.details) ? body.details : [];
  }
}

function headers(extra = {}) {
  const token = tokenProvider();
  return { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

async function parse(response) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!response.ok) {
    if (response.status === 401 && tokenProvider()) unauthorizedHandler();
    throw new ApiError(response.status, body);
  }
  return body;
}

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function send(method, path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: headers(body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  return parse(response);
}

export const api = {
  login: (username, password) => send('POST', '/auth/login', { username, password }),
  createLibrarian: (username, password) => send('POST', '/users', { username, password, role: 'librarian' }),

  categories: () => send('GET', '/categories'),

  books: (params) => send('GET', `/books${query(params)}`),
  createBook: (data) => send('POST', '/books', data),
  updateBook: (id, data) => send('PUT', `/books/${id}`, data),
  deleteBook: (id) => send('DELETE', `/books/${id}`),
  uploadCover: async (id, file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_URL}/books/${id}/cover`, { method: 'PUT', headers: headers(), body: form });
    return parse(response);
  },
  removeCover: (id) => send('DELETE', `/books/${id}/cover`),
  // <img> cannot send the Bearer token, so the cover is fetched as a blob (contract 3.4).
  coverUrl: async (id) => {
    const response = await fetch(`${API_URL}/books/${id}/cover`, { headers: headers() });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
  },

  members: (params) => send('GET', `/members${query(params)}`),
  member: (id) => send('GET', `/members/${id}`),
  createMember: (data) => send('POST', '/members', data),

  createLoan: (memberId, bookIds) =>
    send('POST', '/loans', { member_id: memberId, items: bookIds.map((book_id) => ({ book_id })) }),
  loans: (params) => send('GET', `/loans${query(params)}`),
  returnItem: (loanId, itemId) => send('POST', `/loans/${loanId}/items/${itemId}/return`),
  overdue: (params) => send('GET', `/loans/overdue${query(params)}`),

  mostBorrowed: (from, to) => send('GET', `/reports/most-borrowed${query({ from, to })}`),
};
