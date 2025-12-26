import axios from "axios";
import { User } from "./auth/types";

const API_BASE_URL = import.meta.env.VITE_KODA_DESENVOLVIMENTO || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 segundos para uploads
});

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface LumiPhotoProject {
  id: number;
  name: string;
  client_email?: string;
  client_name?: string;
  client_phone?: string;
  status: "rascunho" | "enviada" | "em_selecao" | "finalizada" | "arquivada" | "excluida";
  description?: string;
  project_type?: string;
  project_date?: string;
  delivery_date?: string;
  contracted_photos?: number;
  max_selections?: number;
  allow_extra_photos?: boolean;
  extra_photos_type?: 'individual' | 'packages' | 'both';
  extra_photo_price?: number;
  require_password?: boolean;
  access_password?: string;
  link_expiration?: number;
  share_link?: string;
  share_token?: string;
  add_watermark?: boolean;
  watermark_text?: string;
  watermark_position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  allow_download?: boolean;
  photos_count?: number;
  views_count?: number;
  selections_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LumiPhotoPhoto {
  id: number;
  project_id: number;
  filename: string;
  original_name: string;
  digital_ocean_url: string;
  thumbnail_url: string | null;
  watermarked_url: string | null;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  has_watermark: boolean;
  watermark_config?: {
    text: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    font_size?: number;
    opacity?: number;
  } | null;
  is_selected: boolean;
  selection_order: number | null;
  upload_date: string;
  metadata?: {
    camera?: string;
    iso?: string;
    aperture?: string;
    shutter_speed?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface LumiPhotoBulkUploadResult {
  photos: LumiPhotoPhoto[];
  failed: {
    name: string;
    message: string;
  }[];
}

export interface LumiPhotoDelivery {
  id: number;
  user_id?: number;
  project_id?: number | null;
  name: string;
  client_email?: string | null;
  description?: string | null;
  delivery_token: string;
  status: string;
  expiration_days?: number | null;
  expires_at?: string | null;
  layout_settings?: {
    logo_url?: string | null;
    primary_color?: string;
    background_color?: string;
    gallery_layout?: 'grid' | 'masonry' | 'slideshow';
    show_logo?: boolean;
    show_photographer_name?: boolean;
  };
  security_settings?: {
    require_password?: boolean;
    password?: string;
    allow_download?: boolean;
    allow_individual_download?: boolean;
    allow_zip_download?: boolean;
    show_metadata?: boolean;
    disable_right_click?: boolean;
    add_watermark_on_view?: boolean;
  };
  total_photos?: number;
  total_downloads?: number;
  zip_url?: string | null;
  created_at: string;
  updated_at: string;
  photos?: LumiPhotoPhoto[];
}

export interface LumiPhotoActivity {
  id: number;
  user_id?: number;
  project_id?: number;
  delivery_id?: number;
  type: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
}

export interface LumiPhotoSettings {
  default_watermark_text?: string;
  default_watermark_position?: string;
  default_link_expiration?: number;
  default_max_selections?: number;
  storage_limit_gb?: number;
  max_projects?: number;
  allow_client_comments?: boolean;
  allow_client_downloads?: boolean;
  notification_email?: string;
}

export interface LumiPhotoWatermarkTemplate {
  id: number;
  name: string;
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  font_size?: number;
  font_color?: string;
  opacity?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface LumiPhotoDashboardStats {
  active_projects: number;
  total_views: number;
  total_selections: number;
  total_photos: number;
  selection_rate: number;
}

// ============================================
// DASHBOARD
// ============================================

export const obterDashboardLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/dashboard", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// ============================================
// PROJECTS
// ============================================

export const obterProjetosLumiPhoto = async (filters: any, user: User | null) => {
  const response = await apiClient.get("/lumiphoto/projects", {
    params: filters,
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const criarProjetoLumiPhoto = async (data: Partial<LumiPhotoProject>, user: User | null) => {
  const response = await apiClient.post("/lumiphoto/projects", data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const obterProjetoLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.get(`/lumiphoto/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const atualizarProjetoLumiPhoto = async (
  projectId: number,
  data: Partial<LumiPhotoProject>,
  user: User | null
) => {
  const response = await apiClient.put(`/lumiphoto/projects/${projectId}`, data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const excluirProjetoLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.delete(`/lumiphoto/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const atualizarStatusProjetoLumiPhoto = async (
  projectId: number,
  status: string,
  user: User | null
) => {
  const response = await apiClient.patch(
    `/lumiphoto/projects/${projectId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data.data || response.data;
};

export const restaurarProjetoLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.patch(
    `/lumiphoto/projects/${projectId}/restore`,
    {},
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data.data || response.data;
};

export const enviarNotificacaoProjetoLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.post(
    `/lumiphoto/projects/${projectId}/send-notification`,
    {},
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data;
};

// ============================================
// PHOTOS
// ============================================

export const obterFotosLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.get(`/lumiphoto/projects/${projectId}/photos`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const uploadFotoLumiPhoto = async (
  projectId: number,
  file: File,
  user: User | null,
  options?: {
    applyWatermark?: boolean;
    watermarkText?: string;
    watermarkPosition?: string;
    watermarkFontSize?: number;
    watermarkOpacity?: number;
  }
) => {
  const formData = new FormData();
  formData.append("file", file);

  // Adicionar opções de watermark se fornecidas
  if (options?.applyWatermark) {
    formData.append("apply_watermark", "true");
    if (options.watermarkText) {
      formData.append("watermark_text", options.watermarkText);
    }
    if (options.watermarkPosition) {
      formData.append("watermark_position", options.watermarkPosition);
    }
    if (options.watermarkFontSize) {
      formData.append("watermark_font_size", options.watermarkFontSize.toString());
    }
    if (options.watermarkOpacity) {
      formData.append("watermark_opacity", options.watermarkOpacity.toString());
    }
  }

  const response = await apiClient.post(`/lumiphoto/projects/${projectId}/photos`, formData, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data || response.data;
};

export const uploadFotosEmLoteLumiPhoto = async (
  projectId: number,
  files: File[],
  user: User | null,
  onProgress?: (progress: number) => void,
  options?: {
    applyWatermark?: boolean;
    watermarkText?: string;
    watermarkPosition?: string;
    watermarkFontSize?: number;
    watermarkOpacity?: number;
  }
): Promise<LumiPhotoBulkUploadResult> => {
  const formData = new FormData();

  // Adicionar arquivos no formato que o Laravel espera: files[]
  files.forEach((file) => {
    formData.append('files[]', file);
  });

  // Adicionar opções de watermark se fornecidas
  if (options?.applyWatermark) {
    formData.append("apply_watermark", "true");
    if (options.watermarkText) {
      formData.append("watermark_text", options.watermarkText);
    }
    if (options.watermarkPosition) {
      formData.append("watermark_position", options.watermarkPosition);
    }
    if (options.watermarkFontSize) {
      formData.append("watermark_font_size", options.watermarkFontSize.toString());
    }
    if (options.watermarkOpacity) {
      formData.append("watermark_opacity", options.watermarkOpacity.toString());
    }
  }

  const response = await apiClient.post(
    `/lumiphoto/projects/${projectId}/photos/bulk-upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );

  const payload = response.data as
    | LumiPhotoPhoto[]
    | {
        data?: LumiPhotoPhoto[];
        failed?: {
          name: string;
          message: string;
        }[];
      };

  if (Array.isArray(payload)) {
    return {
      photos: payload,
      failed: [],
    };
  }

  return {
    photos: payload.data ?? [],
    failed: payload.failed ?? [],
  };
};

export const atualizarFotoLumiPhoto = async (
  projectId: number,
  photoId: number,
  data: Partial<LumiPhotoPhoto>,
  user: User | null
) => {
  const response = await apiClient.put(
    `/lumiphoto/projects/${projectId}/photos/${photoId}`,
    data,
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data.data || response.data;
};

export const excluirFotoLumiPhoto = async (projectId: number, photoId: number, user: User | null) => {
  const response = await apiClient.delete(`/lumiphoto/projects/${projectId}/photos/${photoId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const obterUrlDownloadFotoLumiPhoto = async (
  projectId: number,
  photoId: number,
  user: User | null
) => {
  const response = await apiClient.get(`/lumiphoto/projects/${projectId}/photos/${photoId}/url`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.url || response.data;
};

export const obterUrlThumbnailFotoLumiPhoto = async (
  projectId: number,
  photoId: number,
  user: User | null
) => {
  const response = await apiClient.get(
    `/lumiphoto/projects/${projectId}/photos/${photoId}/thumbnail`,
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data.url || response.data;
};

// ============================================
// DELIVERIES
// ============================================

export const obterEntregasLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/deliveries", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const criarEntregaLumiPhoto = async (data: Partial<LumiPhotoDelivery>, user: User | null) => {
  const response = await apiClient.post("/lumiphoto/deliveries", data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const obterEntregaLumiPhoto = async (deliveryId: number, user: User | null) => {
  const response = await apiClient.get(`/lumiphoto/deliveries/${deliveryId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const atualizarEntregaLumiPhoto = async (
  deliveryId: number,
  data: Partial<LumiPhotoDelivery>,
  user: User | null
) => {
  const response = await apiClient.put(`/lumiphoto/deliveries/${deliveryId}`, data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const excluirEntregaLumiPhoto = async (deliveryId: number, user: User | null) => {
  const response = await apiClient.delete(`/lumiphoto/deliveries/${deliveryId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const enviarNotificacaoEntregaLumiPhoto = async (deliveryId: number, user: User | null) => {
  const response = await apiClient.post(
    `/lumiphoto/deliveries/${deliveryId}/send-notification`,
    {},
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data;
};

export const uploadFotosEntregaLumiPhoto = async (
  deliveryId: number,
  files: File[],
  options: {
    onProgress?: (progress: number) => void;
  } = {},
  user: User | null
) => {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`photos[${index}]`, file);
  });

  const response = await apiClient.post(
    `/lumiphoto/deliveries/${deliveryId}/photos/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutos para uploads de fotos
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options.onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data;
};

export const uploadLogoEntregaLumiPhoto = async (file: File, user: User | null) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await apiClient.post(
    `/lumiphoto/deliveries/logo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data as { url: string; path: string; filename: string };
};

// ============================================
// ACTIVITIES
// ============================================

export const obterAtividadesLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/activities", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const obterAtividadesProjetoLumiPhoto = async (projectId: number, user: User | null) => {
  const response = await apiClient.get(`/lumiphoto/projects/${projectId}/activities`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const obterAtividadesEntregaLumiPhoto = async (deliveryId: number, user: User | null) => {
  const response = await apiClient.get(`/lumiphoto/deliveries/${deliveryId}/activities`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

// ============================================
// SETTINGS & LIMITS
// ============================================

export const obterConfiguracoesLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/settings", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const atualizarConfiguracoesLumiPhoto = async (
  data: Partial<LumiPhotoSettings>,
  user: User | null
) => {
  const response = await apiClient.put("/lumiphoto/settings", data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const verificarLimitesLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/limits/check", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

// ============================================
// WATERMARK TEMPLATES
// ============================================

export const obterTemplatesWatermarkLumiPhoto = async (user: User | null) => {
  const response = await apiClient.get("/lumiphoto/watermark-templates", {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const criarTemplateWatermarkLumiPhoto = async (
  data: Partial<LumiPhotoWatermarkTemplate>,
  user: User | null
) => {
  const response = await apiClient.post("/lumiphoto/watermark-templates", data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const atualizarTemplateWatermarkLumiPhoto = async (
  templateId: number,
  data: Partial<LumiPhotoWatermarkTemplate>,
  user: User | null
) => {
  const response = await apiClient.put(`/lumiphoto/watermark-templates/${templateId}`, data, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data || response.data;
};

export const excluirTemplateWatermarkLumiPhoto = async (templateId: number, user: User | null) => {
  const response = await apiClient.delete(`/lumiphoto/watermark-templates/${templateId}`, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// ============================================
// PUBLIC GALLERY (sem autenticação)
// ============================================

// As rotas públicas precisam usar um client separado sem o prefixo /api/v1
// pois no backend elas estão registradas como Route::prefix('v1/public/lumiphoto')
const publicApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export const obterGaleriaPublicaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.get(`/public/lumiphoto/gallery/${shareToken}`);
  return response.data.data || response.data;
};

export const autenticarGaleriaPublicaLumiPhoto = async (shareToken: string, password: string) => {
  const response = await publicApiClient.post(`/public/lumiphoto/gallery/${shareToken}/auth`, {
    password,
  });
  return response.data;
};

export const registrarVisualizacaoGaleriaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.post(`/public/lumiphoto/gallery/${shareToken}/view`, {});
  return response.data;
};

export const obterSelecoesGaleriaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.get(`/public/lumiphoto/gallery/${shareToken}/selections`);
  return response.data.data || response.data;
};

export const adicionarSelecaoGaleriaLumiPhoto = async (
  shareToken: string,
  photoId: number,
  note?: string
) => {
  const response = await publicApiClient.post(`/public/lumiphoto/gallery/${shareToken}/selections`, {
    photo_id: photoId,
    note,
  });
  return response.data;
};

export const notificarPrimeiraSelecaoGaleriaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.post(`/public/lumiphoto/gallery/${shareToken}/first-selection`, {});
  return response.data;
};

export const atualizarSelecaoGaleriaLumiPhoto = async (
  shareToken: string,
  photoId: number,
  note?: string
) => {
  const response = await publicApiClient.put(
    `/public/lumiphoto/gallery/${shareToken}/selections/${photoId}`,
    { note }
  );
  return response.data;
};

export const removerSelecaoGaleriaLumiPhoto = async (shareToken: string, photoId: number) => {
  const response = await publicApiClient.delete(
    `/public/lumiphoto/gallery/${shareToken}/selections/${photoId}`
  );
  return response.data;
};

export const finalizarSelecaoGaleriaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.post(
    `/public/lumiphoto/gallery/${shareToken}/finalize-selection`,
    {}
  );
  return response.data;
};

export const obterComentariosGaleriaLumiPhoto = async (shareToken: string) => {
  const response = await publicApiClient.get(`/public/lumiphoto/gallery/${shareToken}/comments`);
  return response.data.data || response.data;
};

export const adicionarComentarioGaleriaLumiPhoto = async (
  shareToken: string,
  data: { name: string; email?: string; comment: string; photo_id?: number }
) => {
  const response = await publicApiClient.post(`/public/lumiphoto/gallery/${shareToken}/comments`, data);
  return response.data;
};

// ============================================
// WATERMARK CONFIGURATION
// ============================================

export interface WatermarkConfig {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  font_size?: number;
  opacity?: number;
}

export const configurarMarcaDaguaFoto = async (
  projectId: number,
  photoId: number,
  config: WatermarkConfig,
  user: User | null
) => {
  const response = await apiClient.post(
    `/lumiphoto/projects/${projectId}/photos/${photoId}/watermark`,
    config,
    {
      headers: { Authorization: `Bearer ${user?.token}` },
    }
  );

  return response.data.data || response.data;
};

export const removerMarcaDaguaFoto = async (
  projectId: number,
  photoId: number,
  user: User | null
) => {
  const response = await apiClient.delete(
    `/lumiphoto/projects/${projectId}/photos/${photoId}/watermark`,
    {
      headers: { Authorization: `Bearer ${user?.token}` },
    }
  );

  return response.data.data || response.data;
};

// ============================================
// PUBLIC DELIVERY (sem autenticação)
// ============================================

export const obterEntregaPublicaLumiPhoto = async (deliveryToken: string) => {
  const response = await publicApiClient.get(`/public/lumiphoto/delivery/${deliveryToken}`);
  return response.data.data || response.data;
};

export const registrarVisualizacaoEntregaLumiPhoto = async (deliveryToken: string) => {
  const response = await publicApiClient.post(`/public/lumiphoto/delivery/${deliveryToken}/view`, {});
  return response.data;
};

export const downloadFotoEntregaLumiPhoto = async (deliveryToken: string, photoId: number) => {
  const response = await publicApiClient.get(
    `/public/lumiphoto/delivery/${deliveryToken}/download/${photoId}`,
    { responseType: "blob" }
  );
  return response.data;
};

export const downloadZipEntregaLumiPhoto = async (deliveryToken: string) => {
  const response = await publicApiClient.get(`/public/lumiphoto/delivery/${deliveryToken}/download/zip`, {
    responseType: "blob",
  });
  return response.data;
};

export const registrarDownloadEntregaLumiPhoto = async (
  deliveryToken: string,
  photoId?: number
) => {
  const response = await publicApiClient.post(`/public/lumiphoto/delivery/${deliveryToken}/download-track`, {
    photo_id: photoId,
  });
  return response.data;
};
