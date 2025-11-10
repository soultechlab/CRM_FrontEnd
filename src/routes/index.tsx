import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import AuthCallback from '../components/auth/AuthCallback';
import Layout from '../components/Layout';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import IntegrationsPanel from '../components/admin/integrations/IntegrationsPanel';
import SystemSettings from '../components/admin/SystemSettings';
import Painel from '../components/Painel';
import ListaClientes from '../components/clientes/ListaClientes';
import VisualizacaoCalendario from '../components/calendario/VisualizacaoCalendario';
import Financeiro from '../components/financeiro/Financeiro';
import UserSettings from '../components/settings/UserSettings';
import News from '../components/news/News';
import { Documentos } from '../components/lumidocs/Documentos';
import { Modelos } from '../components/lumidocs/Modelos';
import { DocumentEditor } from '../components/lumidocs/DocumentEditor';
import { LumiPhoto } from '../components/lumiphoto/LumiPhoto';
import { NewProject } from '../components/lumiphoto/NewProject';
import { Delivery } from '../components/lumiphoto/Delivery';
import { NewDelivery } from '../components/lumiphoto/NewDelivery';
import { PublicGallery } from '../components/lumiphoto/public/PublicGallery';

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/galeria/:shareToken" element={<PublicGallery />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="integrations" element={<IntegrationsPanel />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Painel />} />
        <Route path="clientes" element={<ListaClientes />} />
        <Route path="calendario" element={<VisualizacaoCalendario />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<UserSettings />} />
        <Route path="novidades" element={<News />} />
        <Route path="lumidocs" element={<Documentos />} />
        <Route path="modelos" element={<Modelos />} />
        <Route path="criar-modelo" element={<DocumentEditor />} />
        <Route path="lumiphoto" element={<LumiPhoto />} />
        <Route path="lumiphoto/new-project" element={<NewProject />} />
        <Route path="lumiphoto/edit-project/:projectId" element={<NewProject />} />
        <Route path="lumiphoto/delivery" element={<Delivery />} />
        <Route path="lumiphoto/delivery/new" element={<NewDelivery />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
