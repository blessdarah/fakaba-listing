/** Maps Firebase Auth error codes onto the copy the designs call for. */
export type AuthErrorKind =
  | "mismatch"
  | "emailInvalid"
  | "emailInUse"
  | "weakPassword"
  | "tooMany"
  | "network"
  | "generic";

export function authErrorKind(error: unknown): AuthErrorKind {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "mismatch";
    case "auth/invalid-email":
    case "auth/missing-email":
      return "emailInvalid";
    case "auth/email-already-in-use":
      return "emailInUse";
    case "auth/weak-password":
      return "weakPassword";
    case "auth/too-many-requests":
      return "tooMany";
    case "auth/network-request-failed":
      return "network";
    default:
      return "generic";
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 0–4 score used by the sign-up strength meter. */
export function passwordScore(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d|[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.max(1, Math.min(4, Math.round(score)));
}

/** "0:42" */
export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
