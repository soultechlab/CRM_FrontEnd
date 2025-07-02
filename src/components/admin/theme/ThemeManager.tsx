import React from 'react';
import { Save, RotateCcw, Download, Upload } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import ColorPicker from './ColorPicker';
import TypographySettings from './TypographySettings';
import SpacingControls from './SpacingControls';

export default function ThemeManager() {
  const { theme, resetTheme } = useTheme();

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Gerenciador de Tema</h2>
        <div className="flex gap-3">
          <button
            onClick={resetTheme}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </button>
          <button
            onClick={exportTheme}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Colors */}
        <div>
          <h3 className="text-lg font-medium mb-4">Cores</h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker label="Cor Primária" colorKey="primary" />
            <ColorPicker label="Cor Secundária" colorKey="secondary" />
            <ColorPicker label="Fundo" colorKey="background" />
            <ColorPicker label="Barra Lateral" colorKey="sidebar" />
            <ColorPicker label="Cabeçalho" colorKey="header" />
            <ColorPicker label="Texto" colorKey="text" />
          </div>
        </div>

        {/* Typography */}
        <TypographySettings />

        {/* Spacing */}
        <SpacingControls />
      </div>
    </div>
  );
}