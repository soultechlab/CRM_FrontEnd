import { useState } from 'react';
import { Eye, Heart, Calendar, Mail, User, CheckCircle, Clock, Archive, Send, Pencil, XCircle } from 'lucide-react';
import { Offcanvas } from './Offcanvas';

interface Project {
  id: number;
  name: string;
  date: string;
  photos: number;
  downloads?: number;
  views?: number;
  selections?: number;
  status: string;
  clientEmail: string;
}

interface ProjectDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ProjectDetailsOffcanvas({ isOpen, onClose, project }: ProjectDetailsOffcanvasProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'selections' | 'activities' | 'share'>('overview');

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'selections', label: 'Seleções' },
    { id: 'activities', label: 'Atividades' },
    { id: 'share', label: 'Compartilhar' }
  ];

  const mockSelectedPhotos = [
    'IMG_0001.jpg', 'IMG_0015.jpg', 'IMG_0023.jpg', 'IMG_0037.jpg',
    'IMG_0042.jpg', 'IMG_0056.jpg', 'IMG_0067.jpg', 'IMG_0078.jpg'
  ];

  const mockActivities = [
    {
      action: 'Visualizou a galeria',
      timestamp: '10/06/2023 14:25'
    },
    {
      action: 'Selecionou 3 fotos',
      timestamp: '10/06/2023 14:40'
    },
    {
      action: 'Selecionou mais 5 fotos',
      timestamp: '10/06/2023 15:10'
    }
  ];

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'em_selecao': return 'bg-yellow-100 text-yellow-800';
      case 'finalizada': return 'bg-blue-100 text-blue-800';
      case 'arquivada': return 'bg-amber-100 text-amber-800';
      case 'excluida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <Pencil className="h-5 w-5 text-gray-600" />;
      case 'enviada': return <Send className="h-5 w-5 text-green-600" />;
      case 'em_selecao': return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'finalizada': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'arquivada': return <Archive className="h-5 w-5 text-amber-600" />;
      case 'excluida': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{project.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{project.date}</span>
          </div>
        </div>
        <div className={`mt-3 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
          <div className="flex items-center gap-2">
            {getProjectStatusIcon(project.status)}
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {project.views !== undefined ? project.views : project.downloads || 0}
          </div>
          <div className="text-sm text-gray-500">
            {project.views !== undefined ? 'Visualizações' : 'Downloads'}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2">
            <Heart className="h-6 w-6 text-pink-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.selections || 0}</div>
          <div className="text-sm text-gray-500">Seleções</div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Cliente</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-words">Ana Silva</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-all">{project.clientEmail}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h4>
        <div className="space-y-3">
          {mockActivities.map((activity, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-900 font-medium">{activity.action}</span>
              <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSelections = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-900">Fotos Selecionadas (8)</h4>
        <button className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <Eye className="h-4 w-4 mr-1" />
          Ver Seleções
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {mockSelectedPhotos.map((photo, index) => (
          <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative hover:bg-gray-300 transition-colors">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs text-gray-600 bg-white px-1 sm:px-2 py-1 rounded text-center">
              {photo}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h5 className="text-md font-semibold text-gray-900 mb-3">Comentários do Cliente</h5>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed">
            "Adorei todas as fotos! Especialmente as fotos em preto e branco. Podemos incluir mais algumas dessas na seleção final?"
          </p>
        </div>
      </div>
    </div>
  );

  const renderActivities = () => (
    <div className="p-4 sm:p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Todas as Atividades</h4>
      <div className="space-y-4">
        {mockActivities.map((activity, index) => (
          <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4 bg-gray-50 rounded-r-lg pr-4 py-3">
            <div className="text-sm font-medium text-gray-900">{activity.action}</div>
            <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShare = () => (
    <div className="p-4 sm:p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Compartilhar Projeto</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link de Compartilhamento
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={`https://lumiphoto.com/galeria/${project.id}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-gray-50 text-sm"
            />
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
              Copiar
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          💡 Este link permite que o cliente visualize e baixe as fotos selecionadas.
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'selections':
        return renderSelections();
      case 'activities':
        return renderActivities();
      case 'share':
        return renderShare();
      default:
        return renderOverview();
    }
  };

  return (
    <Offcanvas isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </Offcanvas>
  );
}