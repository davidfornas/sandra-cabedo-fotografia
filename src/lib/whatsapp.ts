import { site } from '../config/site';

/** True when a usable WhatsApp phone is configured (non-empty, non-whitespace). */
export function isWhatsAppEnabled(): boolean {
  return site.whatsapp.phone.trim().length > 0;
}

/** Digits-only phone, message URL-encoded exactly as configured; null when disabled. */
export function whatsappUrl(): string | null {
  if (!isWhatsAppEnabled()) return null;
  const phone = site.whatsapp.phone.replace(/\D/g, '');
  const text = encodeURIComponent(site.whatsapp.message);
  return `https://wa.me/${phone}?text=${text}`;
}
