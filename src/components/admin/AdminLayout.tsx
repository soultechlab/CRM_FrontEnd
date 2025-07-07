import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Shield, Users, Settings, LogOut, Camera, Link2, ArrowLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin', icon: Shield, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Usuários' },
    { path: '/admin/integrations', icon: Link2, label: 'Integrações' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/v5kLKJP.png" alt="Imagem" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
        </div>

        <nav className="flex-1">
          {/* Back to User Panel Button */}
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-blue-600 hover:bg-blue-50 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-3" />
            Voltar ao Painel
          </Link>

          <div className="border-t border-gray-200 mb-4"></div>

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
              <Camera className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-bold">Admin Panel</h1>
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
              {/* Back to User Panel Button */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Voltar ao Painel
              </Link>

              <div className="border-t border-gray-200"></div>

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

              <div className="border-t border-gray-200">
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
              </div>
            </nav>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}