const WEBP_ALLOWLIST = new Set([
  'arko-pic',
  'arko-about',
  'portfolio-1',
  'portfolio-2',
  'portfolio-3',
  'portfolio-4',
  'portfolio-5',
  'portfolio-6',
  'portfolio-7',
  'portfolio-8',
  'portfolio-9'
]);

const LOCAL_IMAGE_PATTERN = /^(?:\.?\/)?assets\/images\/([a-z0-9-]+)\.(?:png|jpe?g)$/i;

export function getWebpSource(src) {
  if (!src || typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return null;
  }

  const cleanPath = trimmed.split('?')[0].split('#')[0];
  const match = cleanPath.match(LOCAL_IMAGE_PATTERN);
  if (!match) return null;

  const baseName = match[1].toLowerCase();
  if (!WEBP_ALLOWLIST.has(baseName)) return null;

  return `/assets/images/${baseName}.webp`;
}
