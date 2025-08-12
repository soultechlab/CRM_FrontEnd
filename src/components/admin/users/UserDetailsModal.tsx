import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react';
import { User } from '../../../types/admin';
import { formatarMoeda } from '../../../utils/formatters';
import { toast } from 'react-toastify';
import { formatarDataBR, tempoDecorrido } from '../../../utils/dateUtils';
import LoadingSpinner from '../../shared/LoadingSpinner';
import SocialLinks from './social/SocialLinks';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

interface UserMetrics {
  totalClients: number;
  totalRevenue: number;
  totalServices: number;
  lastActivity: string;
  recentChanges: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        setLoading(true);
        // Simulando chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetrics({
          totalClients: user.totalClients,
          totalRevenue: user.totalFinances,
          totalServices: user.totalAppointments,
          lastActivity: user.lastLogin,
          recentChanges: [
            {
              id: '1',
              action: 'Perfil atualizado',
              timestamp: new Date().toISOString(),
              details: 'Alteração de plano: Free → Mensal'
            },
            {
              id: '2',
              action: 'Cliente adicionado',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              details: 'Novo cliente: Maria Silva'
            }
          ]
        });
      } catch (err) {
        setError('Erro ao carregar métricas do usuário');
        toast.error('Erro ao carregar métricas do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detalhes do Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {user.plan}
              </span>
            </div>

            {/* Social Links */}
            <SocialLinks
              whatsapp={user.whatsapp}
              instagram={user.instagram}
              website={user.website}
              facebook={user.facebook}
              twitter={user.twitter}
              youtube={user.youtube}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          ) : metrics && (
            <>
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total de Clientes</p>
                      <p className="text-lg font-semibold">{metrics.totalClients}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Faturamento Total</p>
                      <p className="text-lg font-semibold">{formatarMoeda(metrics.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Total de Serviços</p>
                      <p className="text-lg font-semibold">{metrics.totalServices}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Histórico de Alterações */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Alterações Recentes</h4>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <p>Em construção...</p>
                  {/* {metrics.recentChanges.map(change => (
                    <div key={change.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{change.action}</p>
                        <p className="text-sm text-gray-600">{change.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {tempoDecorrido(change.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))} */}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Cadastrado em</p>
                  <p className="font-medium">{formatarDataBR(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Último acesso</p>
                  <p className="font-medium">{tempoDecorrido(user.lastLogin)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
