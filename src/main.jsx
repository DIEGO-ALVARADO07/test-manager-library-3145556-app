import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { Layout, RoleGuard } from './components/Components.jsx';
import LoginPage from './pages/LoginPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import MembersPage from './pages/MembersPage.jsx';
import NewLoanPage from './pages/NewLoanPage.jsx';
import LoansPage from './pages/LoansPage.jsx';
import OverduePage from './pages/OverduePage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RoleGuard />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/books" replace />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/loans/new" element={<NewLoanPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/overdue" element={<OverduePage />} />
              <Route element={<RoleGuard roles={['admin']} />}>
                <Route path="/report" element={<ReportPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
