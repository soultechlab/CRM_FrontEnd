import React, { useState, useEffect } from 'react';
import { X, Droplet, Type, Move } from 'lucide-react';
import { toast } from 'react-toastify';

interface WatermarkConfig {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  font?: string;
  font_size?: number;
  opacity?: number;
}

interface FontOption {
  id: string;
  name: string;
}

interface WatermarkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WatermarkConfig) => Promise<void>;
  currentConfig?: WatermarkConfig | null;
  photoName?: string;
  photoPreviewUrl?: string; // URL da foto para preview
}

export function WatermarkConfigModal({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  photoName,
  photoPreviewUrl
}: WatermarkConfigModalProps) {
  const [config, setConfig] = useState<WatermarkConfig>({
    text: currentConfig?.text || '© Seu Estúdio 2024',
    position: currentConfig?.position || 'bottom-right',
    font: currentConfig?.font || 'poppins',
    font_size: currentConfig?.font_size,
    opacity: currentConfig?.opacity || 0.35,
  });
  const [saving, setSaving] = useState(false);
  const [useCustomSize, setUseCustomSize] = useState(!!currentConfig?.font_size);
  const [availableFonts, setAvailableFonts] = useState<FontOption[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(true);

  // Buscar fontes disponíveis
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        // Buscar usuário do localStorage (mesma chave que o AuthService usa)
        const userStr = localStorage.getItem('@FotoCRM:user');
        if (!userStr) {
          throw new Error('Usuário não autenticado');
        }
        const user = JSON.parse(userStr);
        const token = user.token;

        const API_BASE_URL = import.meta.env.VITE_KODA_DESENVOLVIMENTO || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/v1/lumiphoto/settings/available-fonts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAvailableFonts(data.fonts || []);
      } catch (error) {
        console.error('Erro ao buscar fontes:', error);
        toast.error('Erro ao carregar fontes disponíveis');
      } finally {
        setLoadingFonts(false);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        text: currentConfig.text || '© Seu Estúdio 2024',
        position: currentConfig.position || 'bottom-right',
        font: currentConfig.font || 'poppins',
        font_size: currentConfig.font_size,
        opacity: currentConfig.opacity || 0.35,
      });
      setUseCustomSize(!!currentConfig.font_size);
    }
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!config.text.trim()) {
      toast.error('Digite o texto da marca d\'água');
      return;
    }

    try {
      setSaving(true);
      const saveConfig: WatermarkConfig = {
        text: config.text,
        position: config.position,
        font: config.font,
        opacity: config.opacity,
      };

      // Só inclui font_size se o usuário marcou para usar tamanho customizado
      if (useCustomSize && config.font_size) {
        saveConfig.font_size = config.font_size;
      }

      console.info('🛰️ [LUMIPHOTO][WATERMARK_MODAL] Salvando configuração a partir do modal', {
        photoName,
        hasPreview: !!photoPreviewUrl,
        rawConfig: config,
        useCustomSize,
        payload: saveConfig,
      });

      await onSave(saveConfig);
      toast.success('Marca d\'água configurada com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao configurar marca d\'água:', error);
      toast.error(error.message || 'Erro ao configurar marca d\'água');
    } finally {
      setSaving(false);
    }
  };

  const positions = [
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'center', label: 'Centro' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configurar Marca d'Água</h2>
            {photoName && (
              <p className="text-sm text-gray-500 mt-1">{photoName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Texto da marca d'água */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="h-4 w-4" />
              Texto da Marca d'Água
            </label>
            <input
              type="text"
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              placeholder="Ex: © Meu Estúdio 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este texto será exibido como marca d'água na foto
            </p>
          </div>

          {/* Posição com Grid Visual */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Move className="h-5 w-5 text-blue-600" />
              Posição da Marca d'Água
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Selecione onde a marca d'água aparecerá na foto
            </p>

            {/* Grid visual 3x3 para posicionamento */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-3">
              {/* Top Left */}
              <button
                onClick={() => setConfig({ ...config, position: 'top-left' })}
                className={`aspect-square rounded-lg border-2 transition-all flex items-start justify-start p-2 ${
                  config.position === 'top-left'
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                }`}
                title="Superior Esquerdo"
              >
                <div className={`w-2 h-2 rounded-full ${
                  config.position === 'top-left' ? 'bg-blue-600' : 'bg-gray-400'
                }`}></div>
              </button>

              {/* Top Center */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50"></div>

              {/* Top Right */}
              <button
                onClick={() => setConfig({ ...config, position: 'top-right' })}
                className={`aspect-square rounded-lg border-2 transition-all flex items-start justify-end p-2 ${
                  config.position === 'top-right'
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                }`}
                title="Superior Direito"
              >
                <div className={`w-2 h-2 rounded-full ${
                  config.position === 'top-right' ? 'bg-blue-600' : 'bg-gray-400'
                }`}></div>
              </button>

              {/* Middle Left */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50"></div>

              {/* Center */}
              <button
                onClick={() => setConfig({ ...config, position: 'center' })}
                className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center p-2 ${
                  config.position === 'center'
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                }`}
                title="Centro"
              >
                <div className={`w-3 h-3 rounded-full ${
                  config.position === 'center' ? 'bg-blue-600' : 'bg-gray-400'
                }`}></div>
              </button>

              {/* Middle Right */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50"></div>

              {/* Bottom Left */}
              <button
                onClick={() => setConfig({ ...config, position: 'bottom-left' })}
                className={`aspect-square rounded-lg border-2 transition-all flex items-end justify-start p-2 ${
                  config.position === 'bottom-left'
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                }`}
                title="Inferior Esquerdo"
              >
                <div className={`w-2 h-2 rounded-full ${
                  config.position === 'bottom-left' ? 'bg-blue-600' : 'bg-gray-400'
                }`}></div>
              </button>

              {/* Bottom Center */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50"></div>

              {/* Bottom Right */}
              <button
                onClick={() => setConfig({ ...config, position: 'bottom-right' })}
                className={`aspect-square rounded-lg border-2 transition-all flex items-end justify-end p-2 ${
                  config.position === 'bottom-right'
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                }`}
                title="Inferior Direito"
              >
                <div className={`w-2 h-2 rounded-full ${
                  config.position === 'bottom-right' ? 'bg-blue-600' : 'bg-gray-400'
                }`}></div>
              </button>
            </div>

            {/* Label da posição selecionada */}
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ✓ {positions.find(p => p.value === config.position)?.label}
              </span>
            </div>
          </div>

          {/* Seletor de Fonte */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Type className="h-5 w-5 text-blue-600" />
              Estilo da Fonte
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Escolha a fonte que melhor representa seu estúdio
            </p>

            {loadingFonts ? (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="ml-2 text-sm text-gray-600">Carregando fontes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableFonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setConfig({ ...config, font: font.id })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      config.font === font.id
                        ? 'border-blue-500 bg-blue-100 shadow-md'
                        : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50'
                    }`}
                    style={{ fontFamily: font.name }}
                  >
                    <div className="text-sm font-medium text-gray-900">{font.name}</div>
                    <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: font.name }}>
                      {config.text || 'Abc 123'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tamanho da Fonte (Opcional) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Type className="h-5 w-5 text-blue-600" />
                Tamanho da Marca d'Água
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomSize}
                  onChange={(e) => {
                    setUseCustomSize(e.target.checked);
                    if (!e.target.checked) {
                      setConfig({ ...config, font_size: undefined });
                    } else {
                      setConfig({ ...config, font_size: 120 }); // Valor padrão: 120 = 12% da imagem
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-gray-700 font-medium">Personalizar tamanho</span>
              </label>
            </div>

            {useCustomSize ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={config.font_size || 120}
                  onChange={(e) => setConfig({ ...config, font_size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Pequeno (2%)</span>
                  <span className="font-bold text-base text-blue-600">
                    {Math.round((config.font_size || 120) / 10)}% da foto
                  </span>
                  <span>Grande (50%)</span>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  O tamanho será proporcional às dimensões da foto
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ O tamanho será calculado automaticamente (12% da foto)
                </p>
              </div>
            )}
          </div>

          {/* Opacidade */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Droplet className="h-5 w-5 text-blue-600" />
              Opacidade da Marca d'Água
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={config.opacity || 0.35}
                onChange={(e) => setConfig({ ...config, opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Transparente (5%)</span>
                <span className="font-bold text-base text-blue-600">{Math.round((config.opacity || 0.35) * 100)}%</span>
                <span>Opaco (100%)</span>
              </div>
            </div>
          </div>

          {/* Preview Melhorado */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl border-2 border-gray-300 shadow-inner">
            <div className="text-center mb-4">
              <p className="text-base font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                <span className="text-2xl">👁️</span>
                Preview da Marca d'Água
              </p>
              <p className="text-sm text-gray-600">Visualização em tempo real - exatamente como ficará na foto</p>
            </div>
            <div
              className="relative bg-gray-900 rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl"
              style={{ aspectRatio: '16/9', minHeight: '300px' }}
            >
              {/* Imagem real do usuário ou placeholder */}
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-medium mb-2">📷 Sua Foto Aparecerá Aqui</p>
                    <p className="text-gray-500 text-sm">Preview em tempo real da marca d'água</p>
                  </div>
                </div>
              )}

              {/* Grid de referência visual (opcional, pode ser removido) */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-1/3 left-0 right-0 border-t border-white"></div>
                <div className="absolute top-2/3 left-0 right-0 border-t border-white"></div>
                <div className="absolute left-1/3 top-0 bottom-0 border-l border-white"></div>
                <div className="absolute left-2/3 top-0 bottom-0 border-l border-white"></div>
              </div>

              {/* Marca d'água preview - PROPORCIONAL */}
              <div
                className={`absolute ${
                  config.position === 'top-left' ? 'top-6 left-6' :
                  config.position === 'top-right' ? 'top-6 right-6' :
                  config.position === 'bottom-left' ? 'bottom-6 left-6' :
                  config.position === 'bottom-right' ? 'bottom-6 right-6' :
                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                } transition-all duration-300 ease-out`}
              >
                <div className="relative">
                  {/* Indicador de posição (pulsante) */}
                  <div className="absolute -inset-2 bg-blue-500 rounded opacity-20 animate-pulse"></div>

                  {/* Texto da marca d'água - Calcula proporcionalmente como o backend */}
                  <p
                    className="text-white font-bold select-none whitespace-nowrap transition-all duration-300 relative z-10"
                    style={{
                      opacity: config.opacity || 0.35,
                      fontSize: (() => {
                        if (!useCustomSize) return '28px'; // Padrão automático (12% de ~300px = 36px / 1.3 = 28px)

                        // Simula o cálculo do backend: escala relativa × tamanho do preview
                        // Preview container é ~300px de altura, então usamos como referência
                        const previewMaxSide = 300;
                        const relativeScale = Math.max(0.02, Math.min((config.font_size || 120) / 1000, 0.50));
                        const calculatedSize = previewMaxSide * relativeScale;

                        // Divide por 1.3 para ajustar visualmente ao container de preview
                        return `${Math.max(12, Math.min(calculatedSize / 1.3, 100))}px`;
                      })(),
                      textShadow: '2px 2px 6px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.7)',
                      letterSpacing: '1px',
                      fontFamily: (() => {
                        const selectedFont = availableFonts.find(f => f.id === config.font);
                        return selectedFont ? `${selectedFont.name}, sans-serif` : 'system-ui, -apple-system, sans-serif';
                      })(),
                      fontWeight: '700'
                    }}
                  >
                    {config.text || 'Seu texto aqui'}
                  </p>
                </div>
              </div>

              {/* Badge de informação da posição */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                📍 {positions.find(p => p.value === config.position)?.label}
              </div>

              {/* Badge de opacidade */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                💧 {Math.round((config.opacity || 0.35) * 100)}%
              </div>
            </div>

            {/* Dica visual */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600 italic">
                💡 Ajuste a posição, tamanho e opacidade para ver em tempo real
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> A marca d'água será processada e salva permanentemente no bucket.
              Isso garante que a foto sempre terá a marca d'água, protegendo contra uso não autorizado.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium disabled:opacity-50 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </span>
            ) : (
              'Salvar Configuração'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
