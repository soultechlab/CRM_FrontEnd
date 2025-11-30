import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  Eye,
  Activity,
  Upload,
  FolderPlus,
  Send,
  Archive,
  Trash2,
  Download,
  Heart,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { obterAtividadesLumiPhoto, LumiPhotoActivity } from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllActivitiesModal({
  isOpen,
  onClose
}: AllActivitiesModalProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LumiPhotoActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await obterAtividadesLumiPhoto(user);
      setActivities(data);
    } catch (error: any) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'project_created': FolderPlus,
      'project_updated': Activity,
      'project_sent': Send,
      'project_archived': Archive,
      'project_deleted': Trash2,
      'photo_uploaded': Upload,
      'photo_deleted': Trash2,
      'photo_downloaded': Download,
      'photo_selected': Heart,
      'delivery_created': FolderPlus,
      'delivery_sent': Send,
      'delivery_viewed': Eye,
      'delivery_downloaded': Download,
      'gallery_viewed': Eye,
      'comment_added': MessageSquare,
      'default': Activity
    };

    const Icon = iconMap[type] || iconMap['default'];
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    if (type.includes('created')) return 'text-green-600 bg-green-50';
    if (type.includes('deleted')) return 'text-red-600 bg-red-50';
    if (type.includes('uploaded') || type.includes('sent')) return 'text-blue-600 bg-blue-50';
    if (type.includes('viewed')) return 'text-purple-600 bg-purple-50';
    if (type.includes('selected') || type.includes('downloaded')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Todas as Atividades"
      size="xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma atividade registrada</p>
            <p className="text-sm text-gray-400 mt-2">
              As atividades aparecerão aqui conforme você usar o sistema
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <p className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(activity.metadata)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(activity.created_at)}</span>
                    {activity.ip_address && (
                      <>
                        <span>•</span>
                        <span>{activity.ip_address}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}