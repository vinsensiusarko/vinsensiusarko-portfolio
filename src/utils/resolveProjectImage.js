/**
 * Resolves a project's image source from Firestore or fallback data.
 * Supports:
 * - `project.image` (primary field used in Firestore & fallbackData)
 * - `project.imageBase64` (legacy/optional Base64 field)
 * - `project.imageUrl` (legacy/optional URL field)
 * Automatically normalizes relative `assets/...` or `../assets/...` paths to `/assets/...`.
 */
export function resolveProjectImage(project) {
  if (!project) return '/assets/images/portfolio-1.png';

  const raw =
    project.imageBase64 ||
    project.image ||
    project.imageUrl ||
    '/assets/images/portfolio-1.png';

  const trimmed = String(raw).trim();
  if (!trimmed) return '/assets/images/portfolio-1.png';

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('../')) {
    return '/' + trimmed.replace(/^(\.\.\/)+/, '');
  }

  if (trimmed.startsWith('./')) {
    return '/' + trimmed.replace(/^\.\//, '');
  }

  return '/' + trimmed;
}
