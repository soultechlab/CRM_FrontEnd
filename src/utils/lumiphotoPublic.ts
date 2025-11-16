const removeTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const resolvePublicGalleryBaseUrl = () => {
  const fromEnv = (import.meta.env.VITE_LUMIPHOTO_PUBLIC_BASE_URL as string | undefined)?.trim();
  if (fromEnv) {
    return removeTrailingSlash(fromEnv);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return removeTrailingSlash(window.location.origin);
  }

  return '';
};

export const buildPublicGalleryShareUrl = (shareToken?: string | null, shareLink?: string | null) => {
  const baseUrl = resolvePublicGalleryBaseUrl();

  if (shareToken && baseUrl) {
    return `${baseUrl}/galeria/${shareToken}`;
  }

  const sanitizedLink = shareLink?.trim();
  if (!sanitizedLink) {
    return '';
  }

  if (sanitizedLink.startsWith('http://') || sanitizedLink.startsWith('https://')) {
    return sanitizedLink;
  }

  if (!baseUrl) {
    return sanitizedLink;
  }

  if (sanitizedLink.startsWith('/')) {
    return `${baseUrl}${sanitizedLink}`;
  }

  return `${baseUrl}/${sanitizedLink.replace(/^\/+/, '')}`;
};

export const buildDeliveryShareUrl = (deliveryToken?: string | null) => {
  if (!deliveryToken) {
    return '';
  }

  const baseUrl = resolvePublicGalleryBaseUrl();
  if (!baseUrl) {
    return '';
  }

  return `${baseUrl}/entrega/${deliveryToken}`;
};
