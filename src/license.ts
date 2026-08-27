export const PRODUCT_SLUG = 'season-gap-garden';
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/checkout`;
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number }

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export function storedLicense(): string {
  return localStorage.getItem(LICENSE_KEY) || '';
}

export function storeLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedUnlock(): boolean {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as Verdict;
    return verdict.valid;
  } catch {
    return false;
  }
}

export async function verifyLicense(force = false): Promise<{ valid: boolean; reason: string }> {
  const token = storedLicense();
  if (!token) return { valid: false, reason: 'missing' };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as Verdict;
    if (!force && Date.now() - cached.checkedAt < DAY) return { valid: cached.valid, reason: cached.valid ? 'ok' : 'invalid' };
  } catch { /* verify below */ }

  const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License check is temporarily unavailable.');
  const result = await response.json() as { valid: boolean; reason: string };
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies Verdict));
  return result;
}
