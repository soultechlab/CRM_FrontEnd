import { useState } from 'react';
import { 
  Eye, Heart, Calendar, Mail, User, Download, Clock, 
  Share2, Link2, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { Offcanvas } from './Offcanvas';

interface DeliveryProject {
  id: number;
  name: string;
  date: string;
  photos: number;
  downloads: number;
  status: string;
  clientEmail: string;
}

interface DeliveryDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  project: DeliveryProject | null;
}

export function DeliveryDetailsOffcanvas({ isOpen, onClose, project }: DeliveryDetailsOffcanvasProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'link'>('overview');

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'link', label: 'Link de Entrega' }
  ];

  const mockDownloadHistory = [
    {
      clientName: 'Ana Silva',
      downloadCount: 45,
      lastDownload: '10/06/2023 16:30',
      totalSize: '2.3 GB'
    },
    {
      clientName: 'Pedro Santos',
      downloadCount: 23,
      lastDownload: '10/06/2023 14:15',
      totalSize: '1.1 GB'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'criado': return 'bg-gray-100 text-gray-800';
      case 'baixada': return 'bg-blue-100 text-blue-800';
      case 'expirada': return 'bg-red-100 text-red-800';
      case 'excluida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'baixada': return <Download className="h-5 w-5 text-blue-600" />;
      case 'expirada': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'excluida': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Delivery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{project.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>Criado em {project.date}</span>
          </div>
        </div>
        <div className={`mt-3 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.photos}</div>
          <div className="text-sm text-blue-600 font-medium">Fotos Enviadas</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
            <Download className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.downloads}</div>
          <div className="text-sm text-green-600 font-medium">Total Downloads</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">7</div>
          <div className="text-sm text-purple-600 font-medium">Dias Restantes</div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h4>
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

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Share2 className="h-4 w-4 mr-2" />
          Reenviar Link
        </button>
        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Link2 className="h-4 w-4 mr-2" />
          Copiar Link
        </button>
      </div>
    </div>
  );

  const renderDownloads = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Histórico de Downloads</h4>
      
      <div className="space-y-4">
        {mockDownloadHistory.map((download, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{download.clientName}</h5>
                <p className="text-sm text-gray-600">Último download: {download.lastDownload}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{download.downloadCount}</div>
                <div className="text-sm text-gray-500">downloads</div>
                <div className="text-xs text-gray-500">{download.totalSize}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2">Resumo Total</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Downloads únicos:</span>
            <span className="font-bold ml-2">68</span>
          </div>
          <div>
            <span className="text-blue-700">Tamanho total:</span>
            <span className="font-bold ml-2">3.4 GB</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLink = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Link de Entrega</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Principal
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={`https://entrega.lumiphoto.com/galeria/${project.id}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
              Copiar Link
            </button>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h5 className="font-medium text-green-900 mb-2">Status do Link</h5>
          <div className="flex items-center text-sm text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Link ativo e funcionando
          </div>
          <div className="text-xs text-green-600 mt-1">
            Expira em 7 dias (17/06/2023)
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Configurações de Acesso</h5>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-2" checked disabled />
              <span className="text-sm text-gray-700">Permitir downloads</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-2" checked disabled />
              <span className="text-sm text-gray-700">Exibir marca d'água</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-2" disabled />
              <span className="text-sm text-gray-700">Permitir comentários</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'downloads':
        return renderDownloads();
      case 'link':
        return renderLink();
      default:
        return renderOverview();
    }
  };

  return (
    <Offcanvas isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
      {/* Tabs Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </Offcanvas>
  );
}