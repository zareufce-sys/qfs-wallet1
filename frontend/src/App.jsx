import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import Activation from './pages/Activation.jsx';
import FinishActivation from './pages/FinishActivation.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import Layout from './components/Layout.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="fullscreen-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="fullscreen-loader"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="bills" element={<Activation />} />
            <Route path="finish-activation" element={<FinishActivation />} />
            <Route path="notifications" element={<PlaceholderPage />} />
            <Route path="account" element={<Account />} />
            <Route path="card" element={<PlaceholderPage />} />
            <Route path="settings" element={<PlaceholderPage />} />
            <Route path="support" element={<PlaceholderPage />} />
            <Route path="help" element={<PlaceholderPage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
