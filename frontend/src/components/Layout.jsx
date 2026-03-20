import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import { Bell, Search } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        {/* Top banner header */}
        <header className="main-header">
          <div className="main-header-text">
            <h1>Welcome back, {user?.full_name?.split(' ')[0] || user?.username}</h1>
          </div>
          <div className="main-header-actions">
            <button className="icon-btn" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
