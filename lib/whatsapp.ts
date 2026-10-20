import { Linking } from "react-native";

const DEFAULT_COUNTRY_CODE = "237";
const DEFAULT_MOBILE_PREFIX = "6";
const MIN_DIGITS = 7;
// Country code + 9-digit national number
const INTERNATIONAL_DIGITS = 12;
/**
 * WhatsApp deep links require digits only, with the country code and no
 * leading "+", spaces or dashes. Users type whatever they like, so anything
 * stored in `users.phone` has to be coerced before it reaches a URL.
 */
export function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isInternational = trimmed.startsWith("+") || /^00/.test(trimmed);

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length < MIN_DIGITS) return null;

  // An explicit "+" or "00" means the user already told us the country.
  if (isInternational) return digits;

  // Already carries the country code, e.g. 237677387364
  if (digits.length === INTERNATIONAL_DIGITS && digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return digits;
  }

  // Local mobile, e.g. 677387364 -> 237677387364
  if (digits.length === 9 && digits.startsWith(DEFAULT_MOBILE_PREFIX)) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }

  return `${DEFAULT_COUNTRY_CODE}${digits}`;
}

export function hasWhatsAppNumber(raw?: string | null): boolean {
  return normalizePhone(raw) !== null;
}

function buildDeepLink(digits: string, message?: string): string {
  const text = message ? `&text=${encodeURIComponent(message)}` : "";
  return `whatsapp://send?phone=${digits}${text}`;
}

function buildWebFallback(digits: string, message?: string): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export type WhatsAppResult = "opened" | "noNumber" | "unavailable";

/**
 * Opens WhatsApp with the recipient's number and an optional prefilled
 * message, falling back to wa.me when the native app is not installed.
 */
export async function openWhatsApp(
  phone?: string | null,
  message?: string
): Promise<WhatsAppResult> {
  const digits = normalizePhone(phone);
  if (!digits) return "noNumber";

  try {
    const deepLink = buildDeepLink(digits, message);
    if (await Linking.canOpenURL(deepLink)) {
      await Linking.openURL(deepLink);
      return "opened";
    }

    const webFallback = buildWebFallback(digits, message);
    if (await Linking.canOpenURL(webFallback)) {
      await Linking.openURL(webFallback);
      return "opened";
    }
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
  }

  return "unavailable";
}
