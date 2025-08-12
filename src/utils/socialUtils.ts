export const validateInstagram = (username: string): boolean => {
  const cleanUsername = username.replace('@', '');
  return /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);
};

export const formatInstagram = (username: string): string => {
  const cleanUsername = username.trim().replace('@', '');
  return cleanUsername ? `@${cleanUsername}` : '';
};

export const createInstagramLink = (username: string): string => {
  const cleanUsername = username.replace('@', '');
  return `https://instagram.com/${cleanUsername}`;
};

export const formatWhatsApp = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const createWhatsAppLink = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/55${cleaned}`;
};
