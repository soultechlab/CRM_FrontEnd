import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  adicionarSelecaoGaleriaLumiPhoto,
  autenticarGaleriaPublicaLumiPhoto,
  obterGaleriaPublicaLumiPhoto,
  registrarVisualizacaoGaleriaLumiPhoto,
  removerSelecaoGaleriaLumiPhoto,
} from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import {
  Camera,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Eye,
  X,
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

  const selectionLimit = gallery?.max_selections ?? null;
  const selectedCount = useMemo(() => photos.filter(photo => photo.is_selected).length, [photos]);
  const remainingSelections = selectionLimit ? selectionLimit - selectedCount : null;

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
      toast.warning(`Você já escolheu ${selectionLimit} fotos. Remova alguma seleção para continuar.`);
      return;
    }

    try {
      setActionPhotoId(photo.id);

      if (currentlySelected) {
        await removerSelecaoGaleriaLumiPhoto(shareToken, photo.id);
        updatePhotoSelection(photo.id, false, null);
        toast.info('Seleção removida.');
      } else {
        const selection = await adicionarSelecaoGaleriaLumiPhoto(shareToken, photo.id, undefined);
        updatePhotoSelection(photo.id, true, selection.order ?? null);
        toast.success('Foto selecionada com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao atualizar seleção:', err);
      toast.error('Não conseguimos atualizar esta seleção. Verifique sua conexão e tente novamente.');
    } finally {
      setActionPhotoId(null);
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
    if (gallery?.add_watermark) {
      return photo.watermarked_url || photo.thumbnail_url || photo.digital_ocean_url;
    }
    return photo.thumbnail_url || photo.digital_ocean_url;
  };

  const resolveDownloadUrl = (photo: GalleryPhoto) => {
    if (gallery?.add_watermark) {
      return photo.watermarked_url || null;
    }
    return photo.digital_ocean_url;
  };

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

  const renderPhotoModal = () => {
    if (!fullPhoto) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl p-4 md:p-6 flex flex-col">
          <button
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            onClick={() => setFullPhoto(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1 overflow-auto mt-4">
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl p-2">
              <img
                src={gallery.add_watermark ? (fullPhoto.watermarked_url || fullPhoto.thumbnail_url || fullPhoto.digital_ocean_url) : (fullPhoto.watermarked_url || fullPhoto.digital_ocean_url)}
                alt={fullPhoto.original_name || 'Foto selecionada'}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-gray-500">Visualizando</p>
              <p className="text-base font-semibold text-gray-900">
                {fullPhoto.original_name || `Foto ${fullPhoto.id}`}
              </p>
            </div>
            {gallery?.allow_download && resolveDownloadUrl(fullPhoto) && (
              <a
                href={resolveDownloadUrl(fullPhoto) as string}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
              >
                <Download className="h-4 w-4" />
                Baixar original
              </a>
            )}
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
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-600 mb-2">Seu progresso</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{selectedCount}</span>
              {selectionLimit ? (
                <span className="text-gray-600">/ {selectionLimit} selecionadas</span>
              ) : (
                <span className="text-gray-600">fotos favoritas</span>
              )}
            </div>
            {selectionLimit && (
              <p className="text-sm text-gray-600 mt-2">
                {remainingSelections && remainingSelections > 0
                  ? `Você ainda pode escolher ${remainingSelections} foto(s).`
                  : 'Limite atingido. Remova alguma seleção para escolher novas fotos.'}
              </p>
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
