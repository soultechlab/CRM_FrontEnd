import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Home, Users, Calendar, DollarSign, Settings, Menu, LogOut, X, Shield, PartyPopper, FileCheck2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Painel' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/calendario', icon: Calendar, label: 'Agenda' },
    { path: '/financeiro', icon: DollarSign, label: 'Financeiro' },
    { path: '/lumidocs', icon: FileCheck2, label: 'Lumi.Doc' },
    { path: '/novidades', icon: PartyPopper, label: 'Novidades' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/v5kLKJP.png" alt="Imagem" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold">LumiCRM</h1>
          </div>
          <small>👋 Olá, {user?.name}!</small>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActivePath(item.path) ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}

          {/* Admin Link - Only visible for admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isActivePath('/admin') ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Shield className="h-5 w-5 mr-3" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <div className="md:hidden bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img src="https://i.imgur.com/v5kLKJP.png" alt="Imagem" className="w-8 h-8 rounded-full" />
              <h1 className="text-lg font-bold">LumiCRM</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="border-t">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                      isActivePath(item.path) ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin Link in Mobile Menu - Only visible for admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                    isActivePath('/admin') ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Admin
                </Link>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </nav>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}