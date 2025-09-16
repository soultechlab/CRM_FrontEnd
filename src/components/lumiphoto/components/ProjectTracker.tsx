import React from 'react';
import { Upload, Eye, Heart, FolderPlus } from 'lucide-react';

interface ProjectTrackerProps {
  totalUploads: number;
  totalViews: number;
  totalSelections: number;
  activeProjects: number;
}

export function ProjectTracker({ 
  totalUploads, 
  totalViews, 
  totalSelections, 
  activeProjects 
}: ProjectTrackerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center">
          <Upload className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-900">Total de Uploads</span>
        </div>
        <p className="text-2xl font-bold text-blue-600 mt-1">{totalUploads.toLocaleString()}</p>
        <p className="text-xs text-blue-500">de 5.000 fotos</p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center">
          <Eye className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-900">Visualizações</span>
        </div>
        <p className="text-2xl font-bold text-green-600 mt-1">
          {totalViews.toLocaleString()}
        </p>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-900">Seleções</span>
        </div>
        <p className="text-2xl font-bold text-yellow-600 mt-1">
          {totalSelections.toLocaleString()}
        </p>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center">
          <FolderPlus className="h-5 w-5 text-purple-600 mr-2" />
          <span className="text-sm font-medium text-purple-900">Projetos Ativos</span>
        </div>
        <p className="text-2xl font-bold text-purple-600 mt-1">
          {activeProjects}
        </p>
      </div>
    </div>
  );
}