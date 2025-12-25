// Uganda phone normalization helpers
// Normalizes to E.164-like string: +2567XXXXXXXX (9 digits after leading 7)
export function normalizeUgPhone(input: string): string | null {
  const digits = (input || '').replace(/\D/g, '');
  if (!digits) return null;
  // Cases:
  // 1) Local 10-digit mobile starting with 07X: 0 7XXXXXXXX -> +2567XXXXXXXX
  if (digits.length === 10 && digits.startsWith('07')) {
    return '+256' + digits.slice(1);
  }
  // 2) International without plus: 2567XXXXXXXX (12 digits)
  if (digits.length === 12 && digits.startsWith('2567')) {
    return '+' + digits;
  }
  // 3) Already E.164 with plus was stripped -> treat as 2567XXXXXXXX
  if (digits.length === 13 && digits.startsWith('2567')) {
    // unlikely due to stripping non-digits, but safeguard
    return '+' + digits;
  }
  // 4) Fallback: if it contains 9-15 digits, keep last 9..12 and try to build +2567XXXXXXXX when possible
  if (digits.startsWith('7') && digits.length === 9) {
    return '+256' + digits;
  }
  // If not matching, return digits with + as generic e164-ish
  if (digits.length >= 9 && digits.length <= 15) return '+' + digits;
  return null;
}

export function isLikelyUgMobile(input: string): boolean {
  const norm = normalizeUgPhone(input);
  if (!norm) return false;
  // Normalized should be +2567XXXXXXXX. Accept Airtel (070,075) and MTN (076,077,078)
  if (!norm.startsWith('+2567')) return false;
  const pair = norm.slice(4,6); // e.g., '70','75','76','77','78'
  return ['70','75','76','77','78'].includes(pair);
}
