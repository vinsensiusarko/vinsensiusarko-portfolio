import { BrandLogo } from './BrandLogo';

export function SkillIcon({ skill, size = '1.5rem', className = '' }) {
  const name = String(skill?.name || '').trim().toLowerCase();
  const iconClass = String(skill?.iconClass || '').trim().toLowerCase();
  const iconType = String(skill?.iconType || '').toLowerCase();
  const iconUrl = skill?.iconUrl || skill?.customIcon || '';

  // 1. Custom Uploaded Image (PNG / SVG / WebP / Base64 Data URL / Static Path)
  if (iconUrl || iconType === 'upload' || iconType === 'image') {
    const isArkoAsset =
      iconUrl === '/assets/favicon.png' ||
      name.includes('arko') ||
      iconClass.includes('arko');

    if (isArkoAsset && (!iconUrl || iconUrl === '/assets/favicon.png')) {
      const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 24;
      return <BrandLogo size={numericSize} className={className} />;
    }

    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={skill?.name || 'Skill icon'}
          className={`skill-icon skill-icon-img ${isArkoAsset ? 'brand-logo-img' : ''} ${className}`.trim()}
          style={{
            width: size,
            height: size,
            maxWidth: size,
            maxHeight: size,
            objectFit: 'contain',
            display: 'inline-block',
            verticalAlign: 'middle'
          }}
        />
      );
    }
  }

  // 2. Official Arko CMS / Favicon Monogram detection
  const isArko =
    name === 'arko' ||
    name === 'arko cms' ||
    name.includes('arko') ||
    iconClass.includes('fa-arko') ||
    iconClass.includes('arko');

  if (isArko) {
    const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 24;
    return <BrandLogo size={numericSize} className={className} />;
  }

  // 3. Official Dart SVG detection (matches "Dart", "fa-brands fa-dart-lang", "fa-brands fa-dart")
  const isDart =
    name === 'dart' ||
    iconClass.includes('dart') ||
    iconClass.includes('dart-lang');

  if (isDart) {
    return (
      <svg
        className={`skill-icon skill-icon-svg skill-icon-dart ${className}`.trim()}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0
        }}
      >
        <path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.315c.766.047 1.677.788 1.677.788L24 9.948v9.789h-4.263V24H9.789l-9-9C.303 14.5 0 13.795 0 13.105c0-.319.18-.818.316-1.105l3.789-7.895zm.679.679v11.787c.002.543.021 1.024.498 1.508L10.204 23h8.533v-4.263L4.784 4.784zm12.055-.678c-.899-.896-1.809-1.78-2.74-2.643-.302-.267-.567-.468-1.07-.462-.37.014-.87.195-.87.195L6.341 4.105l10.498.001z" />
      </svg>
    );
  }

  // 4. Official Flutter SVG detection (fallback for iconType: 'svg' maintains backward-compat)
  const isFlutter =
    name === 'flutter' ||
    iconClass.includes('flutter') ||
    iconType === 'svg';

  if (isFlutter) {
    return (
      <svg
        className={`skill-icon skill-icon-svg skill-icon-flutter ${className}`.trim()}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0
        }}
      >
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    );
  }

  // 5. Standard Font Awesome icon
  return (
    <i
      className={`${skill?.iconClass || 'fa-solid fa-code'} skill-icon ${className}`.trim()}
      style={{
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
      }}
      aria-hidden="true"
    ></i>
  );
}
