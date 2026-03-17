import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/Signuppage';
import SearchPage       from './pages/adherent/SearchPage';
import BookDetailPage   from './pages/adherent/BookDetailPage';
import BorrowConfirmPage from './pages/adherent/BorrowConfirmPage';
import BorrowSuccessPage from './pages/adherent/BorrowSuccessPage';
import HistoryPage      from './pages/adherent/HistoryPage';
import ManageBooksPage  from './pages/bibliothecaire/ManageBooksPage';
import ManageLoansPage  from './pages/bibliothecaire/ManageLoansPage';
import ManageUsersPage  from './pages/admin/ManageUsersPage';
import ProtectedRoute   from './components/ProtectedRoute';
import Navbar           from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />   {/* ← NEW */}
        <Route path="/"        element={<Navigate to="/search" />} />

        {/* Public */}
        <Route path="/search"      element={<SearchPage />} />
        <Route path="/livres/:id"  element={<BookDetailPage />} />
        <Route path="/livres/:id/emprunt" element={
          <ProtectedRoute roles={['adherent']}>
            <BorrowConfirmPage />
          </ProtectedRoute>
        } />
        <Route path="/emprunt/confirmation" element={
          <ProtectedRoute roles={['adherent']}>
            <BorrowSuccessPage />
          </ProtectedRoute>
        } />

        {/* Adhérent */}
        <Route path="/historique" element={
          <ProtectedRoute roles={['adherent']}>
            <HistoryPage />
          </ProtectedRoute>
        } />

        {/* Bibliothécaire + Admin */}
        <Route path="/gestion/livres" element={
          <ProtectedRoute roles={['bibliothecaire']}>
            <ManageBooksPage />
          </ProtectedRoute>
        } />
        <Route path="/gestion/emprunts" element={
          <ProtectedRoute roles={['bibliothecaire','administrateur']}>
            <ManageLoansPage />
          </ProtectedRoute>
        } />

        {/* Admin uniquement */}
        <Route path="/admin/utilisateurs" element={
          <ProtectedRoute roles={['administrateur']}>
            <ManageUsersPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}