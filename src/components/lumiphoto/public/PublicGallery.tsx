import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  adicionarSelecaoGaleriaLumiPhoto,
  autenticarGaleriaPublicaLumiPhoto,
  obterGaleriaPublicaLumiPhoto,
  registrarVisualizacaoGaleriaLumiPhoto,
  removerSelecaoGaleriaLumiPhoto,
  notificarPrimeiraSelecaoGaleriaLumiPhoto,
  finalizarSelecaoGaleriaLumiPhoto,
} from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Download,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Gem,
  Package,
} from 'lucide-react';

interface GalleryPhoto {
  id: number;
  original_name?: string | null;
  digital_ocean_url: string;
  watermarked_url?: string | null;
  thumbnail_url?: string | null;
  has_watermark?: boolean;
  is_selected?: boolean;
  selection_order?: number | null;
}

interface GalleryData {
  id: number;
  name: string;
  description?: string | null;
  client_name?: string | null;
  project_type?: string | null;
  share_token: string;
  add_watermark?: boolean;
  allow_download?: boolean;
  allow_extra_photos?: boolean;
  extra_photos_type?: 'individual' | 'packages' | 'both';
  extra_photo_price?: number | null;
  package_quantity?: number | null;
  package_price?: number | null;
  require_password?: boolean;
  max_selections?: number | null;
  photos_count?: number;
  selections_count?: number;
  photos?: GalleryPhoto[];
}

const buildAuthStorageKey = (token: string) => `lumiphoto:gallery:${token}:auth`;

export function PublicGallery() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [actionPhotoId, setActionPhotoId] = useState<number | null>(null);
  const [fullPhoto, setFullPhoto] = useState<GalleryPhoto | null>(null);
  const [pendingExtraSelection, setPendingExtraSelection] = useState<GalleryPhoto | null>(null);
  const [isFinalizingSelection, setIsFinalizingSelection] = useState(false);
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const selectionLimit = gallery?.max_selections ?? null;
  const selectedCount = useMemo(() => photos.filter(photo => photo.is_selected).length, [photos]);
  const remainingSelections = selectionLimit ? selectionLimit - selectedCount : null;

  // Calcula quantidade de fotos extras selecionadas
  const extraPhotosCount = useMemo(() => {
    if (!selectionLimit || selectedCount <= selectionLimit) return 0;
    return selectedCount - selectionLimit;
  }, [selectedCount, selectionLimit]);

  // Calcula o valor total das fotos extras
  const calculateExtraPhotosTotal = useMemo(() => {
    if (extraPhotosCount === 0 || !gallery?.allow_extra_photos) return 0;

    const extraPhotosType = gallery.extra_photos_type || 'individual';
    const individualPrice = gallery.extra_photo_price || 0;
    const packageQuantity = gallery.package_quantity || 0;
    const packagePrice = gallery.package_price || 0;

    // Se vende apenas individual
    if (extraPhotosType === 'individual') {
      return extraPhotosCount * individualPrice;
    }

    // Se vende apenas pacotes
    if (extraPhotosType === 'packages' && packageQuantity > 0) {
      const packagesNeeded = Math.ceil(extraPhotosCount / packageQuantity);
      return packagesNeeded * packagePrice;
    }

    // Se vende ambos, calcula o melhor preço (menor valor)
    if (extraPhotosType === 'both' && packageQuantity > 0) {
      const individualTotal = extraPhotosCount * individualPrice;
      const packagesNeeded = Math.ceil(extraPhotosCount / packageQuantity);
      const packageTotal = packagesNeeded * packagePrice;
      return Math.min(individualTotal, packageTotal);
    }

    return extraPhotosCount * individualPrice;
  }, [extraPhotosCount, gallery]);

  useEffect(() => {
    if (!shareToken) return;
    loadGallery(shareToken);
  }, [shareToken]);

  useEffect(() => {
    if (!shareToken || !gallery) return;
    if (gallery.require_password && !isAuthenticated) return;

    registrarVisualizacaoGaleriaLumiPhoto(shareToken).catch(() => {
      // Registrar visualização é auxiliar; falhas não devem travar a experiência.
    });
  }, [gallery, isAuthenticated, shareToken]);

  const loadGallery = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await obterGaleriaPublicaLumiPhoto(token);
      setGallery(data);
      setPhotos(Array.isArray(data.photos) ? data.photos : []);

      if (data.require_password) {
        const storedAuth = sessionStorage.getItem(buildAuthStorageKey(token));
        setIsAuthenticated(storedAuth === 'true');
      } else {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Erro ao carregar galeria pública:', err);
      setError('Não foi possível carregar esta galeria. Verifique o link ou tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!shareToken || !password) {
      setAuthError('Informe a senha para continuar.');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const response = await autenticarGaleriaPublicaLumiPhoto(shareToken, password);

      if (response.authenticated) {
        sessionStorage.setItem(buildAuthStorageKey(shareToken), 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('Senha incorreta. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao autenticar galeria:', err);
      setAuthError('Não conseguimos verificar esta senha. Tente novamente em instantes.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleToggleSelection = async (photo: GalleryPhoto) => {
    if (!shareToken || !gallery) return;

    const currentlySelected = !!photo.is_selected;

    if (!currentlySelected && selectionLimit && selectedCount >= selectionLimit) {
      if (gallery.allow_extra_photos) {
        setPendingExtraSelection(photo);
        return;
      } else {
        toast.warning(`Você já escolheu ${selectionLimit} fotos. Remova alguma seleção para continuar.`);
        return;
      }
    }

    try {
      setActionPhotoId(photo.id);

      if (currentlySelected) {
        await removerSelecaoGaleriaLumiPhoto(shareToken, photo.id);
        updatePhotoSelection(photo.id, false, null);
        toast.info('Seleção removida.');
      } else {
        // Verifica se é a primeira seleção para notificar mudança de status
        const isPrimeiraSelecao = selectedCount === 0;

        const selection = await adicionarSelecaoGaleriaLumiPhoto(shareToken, photo.id, undefined);
        updatePhotoSelection(photo.id, true, selection.order ?? null);

        // Notifica o backend sobre a primeira seleção para mudar status para "em seleção"
        if (isPrimeiraSelecao) {
          try {
            await notificarPrimeiraSelecaoGaleriaLumiPhoto(shareToken);
          } catch (notifyErr) {
            // Falha ao notificar não deve impedir a seleção
            console.warn('Não foi possível atualizar status do projeto:', notifyErr);
          }
        }

        toast.success('Foto selecionada com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao atualizar seleção:', err);
      toast.error('Não conseguimos atualizar esta seleção. Verifique sua conexão e tente novamente.');
    } finally {
      setActionPhotoId(null);
    }
  };

  const confirmExtraSelection = async () => {
    if (!pendingExtraSelection || !shareToken || !gallery) return;

    try {
      setActionPhotoId(pendingExtraSelection.id);

      // Verifica se é a primeira seleção para notificar mudança de status
      const isPrimeiraSelecao = selectedCount === 0;

      const selection = await adicionarSelecaoGaleriaLumiPhoto(shareToken, pendingExtraSelection.id, undefined);
      updatePhotoSelection(pendingExtraSelection.id, true, selection.order ?? null);

      // Notifica o backend sobre a primeira seleção para mudar status para "em seleção"
      if (isPrimeiraSelecao) {
        try {
          await notificarPrimeiraSelecaoGaleriaLumiPhoto(shareToken);
        } catch (notifyErr) {
          // Falha ao notificar não deve impedir a seleção
          console.warn('Não foi possível atualizar status do projeto:', notifyErr);
        }
      }

      toast.success('Foto selecionada (custo adicional pode ser aplicado).');
    } catch (err) {
      console.error('Erro ao confirmar seleção extra:', err);
      toast.error('Não conseguimos adicionar esta foto extra. Tente novamente.');
    } finally {
      setActionPhotoId(null);
      setPendingExtraSelection(null);
    }
  };

  const cancelExtraSelection = () => {
    setPendingExtraSelection(null);
  };

  const handleFinalizeSelection = () => {
    if (!shareToken || selectedCount === 0) {
      toast.warning('Você precisa selecionar pelo menos uma foto antes de finalizar.');
      return;
    }

    // Mostra o modal de confirmação
    setShowConfirmFinalize(true);
  };

  const confirmFinalizeSelection = async () => {
    if (!shareToken) return;

    try {
      setIsFinalizingSelection(true);
      setShowConfirmFinalize(false);

      await finalizarSelecaoGaleriaLumiPhoto(shareToken);

      // Mostra o modal de agradecimento
      setShowThankYouModal(true);
    } catch (err) {
      console.error('Erro ao finalizar seleção:', err);
      toast.error('Não foi possível finalizar a seleção. Tente novamente.');
    } finally {
      setIsFinalizingSelection(false);
    }
  };

  const updatePhotoSelection = (photoId: number, isSelected: boolean, order: number | null) => {
    setPhotos(prev =>
      prev.map(item =>
        item.id === photoId
          ? { ...item, is_selected: isSelected, selection_order: order }
          : item
      )
    );

    // Atualizar também a foto do modal se estiver aberta
    if (fullPhoto && fullPhoto.id === photoId) {
      setFullPhoto(prev => prev ? { ...prev, is_selected: isSelected, selection_order: order } : prev);
    }

    setGallery(prev =>
      prev
        ? {
            ...prev,
            selections_count: Math.max(0, (prev.selections_count || 0) + (isSelected ? 1 : -1)),
          }
        : prev
    );
  };

  const resolvePreviewUrl = (photo: GalleryPhoto) => {
    // Sempre priorizar a versão com marca d'água quando existir
    if (photo.watermarked_url) return photo.watermarked_url;
    if (gallery?.add_watermark) return photo.thumbnail_url || photo.digital_ocean_url;
    return photo.thumbnail_url || photo.digital_ocean_url;
  };

  const resolveDownloadUrl = (photo: GalleryPhoto) => {
    // Download também deve priorizar a imagem com marca d'água, quando disponível
    if (photo.watermarked_url) return photo.watermarked_url;
    if (gallery?.add_watermark) return photo.watermarked_url || null;
    return photo.digital_ocean_url;
  };

  const getCurrentPhotoIndex = useCallback(() => {
    if (!fullPhoto) return -1;
    return photos.findIndex(p => p.id === fullPhoto.id);
  }, [fullPhoto, photos]);

  const navigateToPhoto = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = getCurrentPhotoIndex();
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    }

    setFullPhoto(photos[newIndex]);
  }, [getCurrentPhotoIndex, photos]);

  // Keyboard navigation
  useEffect(() => {
    if (!fullPhoto) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateToPhoto('prev');
      } else if (e.key === 'ArrowRight') {
        navigateToPhoto('next');
      } else if (e.key === 'Escape') {
        setFullPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fullPhoto, navigateToPhoto]);

  const renderLoading = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-gray-700">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
      <p className="text-base text-center">Preparando sua galeria Lumi Photo...</p>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-3xl p-8 text-center space-y-5">
        <ImageIcon className="h-12 w-12 mx-auto text-rose-500" />
        <div>
          <p className="text-xl font-semibold text-gray-900">Ops, algo não saiu como esperado.</p>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
        {shareToken && (
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            onClick={() => loadGallery(shareToken)}
          >
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );

  const renderAuthGate = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-blue-100 rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Acesso restrito</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">{gallery?.name || 'Galeria protegida'}</h1>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Esta galeria foi protegida pelo fotógrafo. Informe a senha enviada para você aproveitar as fotos e realizar suas seleções.
        </p>

        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="gallery-password">
          Senha
        </label>
        <input
          id="gallery-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAuthenticate();
            }
          }}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite a senha recebida"
        />

        {authError && <p className="text-rose-500 text-sm mt-2">{authError}</p>}

        <button
          className="w-full mt-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-70"
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando...
            </span>
          ) : (
            'Desbloquear galeria'
          )}
        </button>
      </div>
    </div>
  );

  const renderExtraSelectionModal = () => {
    if (!pendingExtraSelection || !gallery) return null;

    const extraPhotosType = gallery.extra_photos_type || 'individual';
    const individualPrice = gallery.extra_photo_price;
    const packageQuantity = gallery.package_quantity;
    const packagePrice = gallery.package_price;
    const pricePerPhotoInPackage = packageQuantity && packagePrice ? packagePrice / packageQuantity : 0;

    const showIndividual = extraPhotosType === 'individual' || extraPhotosType === 'both';
    const showPackage = extraPhotosType === 'packages' || extraPhotosType === 'both';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-500 font-semibold">Foto Extra</p>
            <h3 className="text-xl font-bold text-gray-900">Você atingiu o limite!</h3>
            <p className="text-gray-600">
              Você já selecionou {selectionLimit} fotos do seu pacote contratado.
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Opções de compra de fotos extras:
            </h4>

            <div className="space-y-3">
              {/* Opção Individual */}
              {showIndividual && individualPrice !== null && individualPrice !== undefined && (
                <div className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">💎 Compra Individual</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {Number(individualPrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Adicione apenas esta foto ao seu pacote
                  </p>
                </div>
              )}

              {/* Opção Pacote */}
              {showPackage && packageQuantity && packagePrice && (
                <div className="bg-white border-2 border-green-300 rounded-lg p-4 hover:border-green-500 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">📦 Pacote de Fotos</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {Number(packagePrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {packageQuantity} fotos adicionais
                    </p>
                    <p className="text-xs text-green-700 font-medium">
                      💰 Economia: R$ {pricePerPhotoInPackage.toFixed(2)} por foto
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-900 text-sm">
            <p className="font-semibold">⚠️ Atenção</p>
            <p className="mt-1">
              {extraPhotosType === 'both'
                ? 'Entre em contato com o fotógrafo para escolher a melhor opção de compra.'
                : 'Entre em contato com o fotógrafo para confirmar o valor final e forma de pagamento.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={cancelExtraSelection}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmExtraSelection}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={actionPhotoId === pendingExtraSelection.id}
            >
              {actionPhotoId === pendingExtraSelection.id ? 'Selecionando...' : 'Selecionar mesmo assim'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmFinalizeModal = () => {
    if (!showConfirmFinalize) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">Confirmar Finalização</h3>
            <p className="text-gray-600">
              Você está prestes a finalizar sua seleção de fotos. Após confirmar, suas escolhas serão enviadas ao fotógrafo.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total selecionado:</span>
              <span className="text-2xl font-bold text-blue-600">{selectedCount} foto{selectedCount !== 1 ? 's' : ''}</span>
            </div>

            {selectionLimit && (
              <div className="mt-3 pt-3 border-t border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pacote contratado:</span>
                  <span className="font-semibold text-gray-900">{selectionLimit} fotos</span>
                </div>
                {extraPhotosCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 font-medium">Fotos extras:</span>
                    <span className="font-bold text-yellow-900">+{extraPhotosCount} foto{extraPhotosCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 text-center">
            Deseja confirmar e finalizar sua seleção?
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirmFinalize(false)}
              className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmFinalizeSelection}
              disabled={isFinalizingSelection}
              className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFinalizingSelection ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderThankYouModal = () => {
    if (!showThankYouModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-5 bg-green-100 rounded-full animate-pulse">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Obrigado por Selecionar!</h2>
            <p className="text-lg text-gray-600">
              Sua seleção de <span className="font-bold text-blue-600">{selectedCount} foto{selectedCount !== 1 ? 's' : ''}</span> foi recebida com sucesso.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Próximos Passos</p>
                <p className="text-sm text-gray-600 mt-1">
                  O fotógrafo foi notificado e entrará em contato em breve para dar continuidade ao processo de edição e entrega das suas fotos.
                </p>
              </div>
            </div>
          </div>

          {extraPhotosCount > 0 && gallery?.allow_extra_photos && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-yellow-700" />
                <p className="font-semibold text-yellow-900">Fotos Extras</p>
              </div>
              <p className="text-sm text-yellow-800">
                Você selecionou {extraPhotosCount} foto{extraPhotosCount !== 1 ? 's' : ''} extra{extraPhotosCount !== 1 ? 's' : ''}.
                O fotógrafo entrará em contato para combinar o pagamento e forma de entrega.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center pt-4">
            <button
              onClick={() => {
                window.location.href = 'https://www.lumicrm.com.br/';
              }}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoModal = () => {
    if (!fullPhoto) return null;

    const currentIndex = getCurrentPhotoIndex();
    const totalPhotos = photos.length;
    const hasMultiplePhotos = totalPhotos > 1;
    const isSelected = !!fullPhoto.is_selected;
    const isActionInProgress = actionPhotoId === fullPhoto.id;

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
        <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col">
          {/* Header com botão fechar e contador */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="text-white text-sm font-medium">
                {currentIndex + 1} / {totalPhotos}
              </div>
              {isSelected && (
                <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Selecionada
                </div>
              )}
            </div>
            <button
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              onClick={() => setFullPhoto(null)}
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Container da imagem com setas laterais */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Seta Esquerda */}
            {hasMultiplePhotos && (
              <button
                onClick={() => navigateToPhoto('prev')}
                className="absolute left-2 md:left-4 z-10 p-3 md:p-4 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl transition-all hover:scale-110"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}

            {/* Imagem */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-full max-h-full overflow-hidden">
              {isSelected && (
                <div className="absolute top-6 right-6 z-10 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              )}
              <img
                src={resolvePreviewUrl(fullPhoto)}
                alt={fullPhoto.original_name || 'Foto selecionada'}
                className="max-h-[70vh] max-w-full object-contain mx-auto"
              />
            </div>

            {/* Seta Direita */}
            {hasMultiplePhotos && (
              <button
                onClick={() => navigateToPhoto('next')}
                className="absolute right-2 md:right-4 z-10 p-3 md:p-4 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl transition-all hover:scale-110"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}
          </div>

          {/* Footer com informações e ações */}
          <div className="mt-4 bg-white rounded-2xl p-4 md:p-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Visualizando</p>
              <p className="text-base font-semibold text-gray-900">
                {fullPhoto.original_name || `Foto ${fullPhoto.id}`}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {hasMultiplePhotos && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <span>Use as setas ← → para navegar</span>
                </div>
              )}

              {/* Botão de Selecionar/Desselecionar */}
              <button
                onClick={() => handleToggleSelection(fullPhoto)}
                disabled={isActionInProgress}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-red-50 text-red-700 border-2 border-red-300 hover:bg-red-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isActionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isActionInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : isSelected ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Remover Seleção</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selecionar Foto</span>
                  </>
                )}
              </button>

              {/* Botão de Download */}
              {gallery?.allow_download && resolveDownloadUrl(fullPhoto) && (
                <a
                  href={resolveDownloadUrl(fullPhoto) as string}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors border-2 border-gray-300"
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!gallery || !shareToken) return null;
  if (gallery.require_password && !isAuthenticated) return renderAuthGate();

  const totalPhotos = gallery.photos_count || photos.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {renderPhotoModal()}
      {renderExtraSelectionModal()}
      {renderConfirmFinalizeModal()}
      {renderThankYouModal()}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Lumi Photo</p>
              <h1 className="text-2xl font-semibold text-gray-900">Galeria compartilhada</h1>
            </div>
          </div>
          {gallery.client_name && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Cliente: <span className="font-semibold text-gray-900">{gallery.client_name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Banner informativo do pacote */}
      {selectionLimit && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Informações do Pacote Contratado */}
                <div className="flex-1">
                  <h3 className="text-white text-lg md:text-xl font-bold mb-2 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Seu Pacote Contratado
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-extrabold text-white">
                      {selectionLimit}
                    </span>
                    <span className="text-blue-100 text-lg">
                      foto{selectionLimit !== 1 ? 's' : ''} incluída{selectionLimit !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-blue-100 mb-2">
                      <span>{selectedCount} selecionada{selectedCount !== 1 ? 's' : ''}</span>
                      <span>{remainingSelections !== null && remainingSelections >= 0 ? `${remainingSelections} restante${remainingSelections !== 1 ? 's' : ''}` : 'Completo'}</span>
                    </div>
                    <div className="w-full bg-blue-800/30 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedCount >= selectionLimit ? 'bg-yellow-400' : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(100, (selectedCount / selectionLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Opções de Fotos Extras */}
                {gallery.allow_extra_photos && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 md:min-w-[280px]">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Fotos Extras
                    </h4>
                    <div className="space-y-2">
                      {(gallery.extra_photos_type === 'individual' || gallery.extra_photos_type === 'both') &&
                       gallery.extra_photo_price !== null && gallery.extra_photo_price !== undefined && (
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-100 text-sm">Individual</span>
                            <span className="text-white font-bold text-lg">
                              R$ {Number(gallery.extra_photo_price).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-blue-100 text-xs mt-1">por foto adicional</p>
                        </div>
                      )}

                      {(gallery.extra_photos_type === 'packages' || gallery.extra_photos_type === 'both') &&
                       gallery.package_quantity && gallery.package_price && (
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-blue-100 text-sm">Pacote</span>
                            <span className="text-white font-bold text-lg">
                              R$ {Number(gallery.package_price).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-blue-100 text-xs">
                            {gallery.package_quantity} fotos extras
                          </p>
                          <p className="text-yellow-300 text-xs mt-1 font-medium">
                            💰 R$ {(Number(gallery.package_price) / gallery.package_quantity).toFixed(2)}/foto
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Aviso quando atingir o limite */}
              {selectedCount >= selectionLimit && (
                <div className="mt-4 bg-yellow-400 text-yellow-900 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Limite atingido!</p>
                    <p className="text-xs mt-1">
                      Você já selecionou {selectionLimit} fotos. Fotos adicionais terão custo extra.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium w-fit">
              <Sparkles className="h-4 w-4" />
              Experiência Lumi Photo
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">{gallery.name}</h2>
              {gallery.description && <p className="text-gray-600 mt-2 max-w-3xl">{gallery.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6 text-sm text-gray-600">
            {gallery.project_type && (
              <span className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 capitalize">
                Projeto: <strong className="text-gray-900">{gallery.project_type}</strong>
              </span>
            )}
            <span className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              Fotos: <strong className="text-gray-900">{totalPhotos}</strong>
            </span>
            {selectionLimit && (
              <span className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                Seleções permitidas: <strong>{selectionLimit}</strong>
              </span>
            )}
            {gallery.allow_download && (
              <span className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Downloads liberados
              </span>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Como funciona</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-600">
              <li>Explore as imagens abaixo e clique para ampliar quando quiser analisar detalhes.</li>
              <li>Use o botão &quot;Escolher&quot; para indicar as suas favoritas.</li>
              <li>
                Se mudar de ideia, clique novamente no botão para remover a seleção — suas alterações são salvas automaticamente.
              </li>
              <li>Assim que finalizar, avise o fotógrafo para que ele continue o processo de edição e entrega.</li>
            </ol>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-bold">Resumo da Seleção</p>
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>

            {/* Total Selecionado */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-gray-900">{selectedCount}</span>
                <span className="text-gray-600 text-lg">foto{selectedCount !== 1 ? 's' : ''} selecionada{selectedCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Breakdown das fotos quando há limite */}
            {selectionLimit && (
              <div className="space-y-3">
                {/* Pacote Contratado */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-700">Pacote Contratado</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Incluídas no valor pago</span>
                    <span className="text-xl font-bold text-green-600">{selectionLimit} fotos</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Selecionadas:</span>
                      <span className="font-semibold text-gray-900">{Math.min(selectedCount, selectionLimit)} / {selectionLimit}</span>
                    </div>
                  </div>
                </div>

                {/* Fotos Extras */}
                {extraPhotosCount > 0 && gallery.allow_extra_photos && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></div>
                        <span className="text-sm font-bold text-yellow-900">Fotos Extras</span>
                      </div>
                      <DollarSign className="h-5 w-5 text-yellow-700" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-yellow-800">Quantidade:</span>
                        <span className="text-lg font-bold text-yellow-950">+ {extraPhotosCount} foto{extraPhotosCount !== 1 ? 's' : ''}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-yellow-800 bg-yellow-100/50 -mx-2 px-2 py-1 rounded">
                        <span>
                          {gallery.extra_photos_type === 'individual' && `${extraPhotosCount} × R$ ${Number(gallery.extra_photo_price).toFixed(2)}`}
                          {gallery.extra_photos_type === 'packages' && gallery.package_quantity && `${Math.ceil(extraPhotosCount / gallery.package_quantity)} pacote(s) de ${gallery.package_quantity}`}
                          {gallery.extra_photos_type === 'both' && 'Melhor preço aplicado'}
                        </span>
                      </div>

                      <div className="pt-2 mt-2 border-t-2 border-yellow-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-yellow-900">Valor Adicional:</span>
                          <span className="text-2xl font-extrabold text-yellow-950">
                            R$ {calculateExtraPhotosTotal.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-800 mt-1 text-right font-medium">
                          a pagar ao fotógrafo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensagem quando tem saldo */}
                {remainingSelections !== null && remainingSelections > 0 && extraPhotosCount === 0 && (
                  <div className="bg-blue-100 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-800 text-center">
                      ✨ Você ainda pode escolher <span className="font-bold">{remainingSelections}</span> foto{remainingSelections !== 1 ? 's' : ''} sem custo extra
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                Suas escolhas ficam vinculadas a este link automaticamente.
              </div>
              {gallery.add_watermark && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  As prévias mostram marca d&apos;água para proteger o ensaio.
                </div>
              )}
            </div>

            {/* Botão de Finalizar Seleção */}
            {selectedCount > 0 && (
              <button
                onClick={handleFinalizeSelection}
                disabled={isFinalizingSelection}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isFinalizingSelection ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Finalizar Seleção
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Galeria completa</h3>
              <p className="text-gray-600 text-sm mt-1">Clique em uma imagem para abrir em tela cheia ou use o botão &quot;Escolher&quot;.</p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-colors w-full sm:w-auto justify-center"
              onClick={() => loadGallery(shareToken)}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar lista
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-gray-600 shadow-sm">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              Nenhuma foto foi disponibilizada ainda. Volte mais tarde ou entre em contato com o fotógrafo.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map(photo => {
                const previewUrl = resolvePreviewUrl(photo);
                const isSelected = !!photo.is_selected;
                const isBusy = actionPhotoId === photo.id;

                return (
                  <div
                    key={photo.id}
                    className={`group flex flex-col rounded-3xl border bg-white shadow-sm overflow-hidden transition-all ${
                      isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                    }`}
                  >
                    <button
                      className="relative w-full h-64"
                      onClick={() => setFullPhoto(photo)}
                      aria-label="Visualizar foto"
                    >
                      <img
                        src={previewUrl}
                        alt={photo.original_name || `Foto ${photo.id}`}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </button>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {photo.original_name || `Arquivo ${photo.id}`}
                        </p>
                        {photo.selection_order && (
                          <p className="text-sm text-gray-500">Seleção #{photo.selection_order}</p>
                        )}
                      </div>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                              : 'bg-blue-600 text-white hover:bg-blue-500'
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleSelection(photo);
                          }}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {isSelected ? 'Selecionada' : 'Escolher'}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setFullPhoto(photo);
                            }}
                            className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            aria-label="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {gallery.allow_download && resolveDownloadUrl(photo) && (
                            <a
                              href={resolveDownloadUrl(photo) as string}
                              target="_blank"
                              rel="noreferrer"
                              onClick={event => event.stopPropagation()}
                              className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                              aria-label="Baixar foto"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
