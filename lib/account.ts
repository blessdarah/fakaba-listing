import Constants from "expo-constants";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export const LINKS = {
  terms: "https://www.fakaba.com/terms",
  privacy: "https://fakaba.com/privacy-policy",
  // TODO: confirm the support inbox before release.
  support: "mailto:support@fakaba.com",
};

/** "677387364" → "677 38 73 64" (Cameroon mobile grouping). */
export function groupLocalDigits(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

/** Stored "+237677387364" (or anything the user typed) → local 9 digits. */
export function localDigitsOf(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.startsWith("237") && digits.length > 9 ? digits.slice(3) : digits;
}

/** Stored phone → "+237 677 38 73 64". */
export function formatPhone(phone?: string | null) {
  const local = localDigitsOf(phone);
  return local ? `+237 ${groupLocalDigits(local)}` : "";
}

export function displayNameOf(profile: { firstName?: string; lastName?: string; businessName?: string; accountType?: string } | null, fallback?: string | null) {
  if (profile?.accountType === "company" && profile.businessName) return profile.businessName;
  const name = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  return name || fallback || "";
}

/** Fakaba's own line for Services ("Ask Fakaba on WhatsApp"). */
// TODO: confirm the business WhatsApp number before release.
export const FAKABA_PHONE = "+237672374414";
