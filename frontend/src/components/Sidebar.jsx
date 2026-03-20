import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CheckCircle,
  FileText,
  Bell,
  User,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/bills', label: 'Activation', icon: FileText },
  { to: '/finish-activation', label: 'Finish Activation', icon: CheckCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const accountNav = [
  { to: '/account', label: 'Account', icon: User },
];

const supportNav = [
  { to: '/help', label: 'Help', icon: HelpCircle },
];

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <img src="/qfs-logo.svg" alt="QFS logo" className="sidebar-brand-logo" />
        </div>
        <span className="sidebar-brand-name">QFS Account</span>
      </div>

      <nav className="sidebar-nav">
        {/* Main navigation */}
        <div className="sidebar-nav-group">
          {mainNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          {user?.role === 'admin' && (
            <NavItem to="/admin" label="Manage Users" icon={ShieldCheck} />
          )}
        </div>

        <div className="sidebar-divider" />

        {/* Account navigation */}
        <div className="sidebar-nav-group">
          {accountNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <div className="sidebar-divider" />

        {/* Support navigation */}
        <div className="sidebar-nav-group">
          {supportNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-nav-item sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
