import { useTheme } from '../../context/ThemeContext';

export function BrandLogo({ size = 28, className = '' }) {
  let theme = 'light';
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) theme = themeContext.theme;
  } catch {
    // In tests or outside ThemeProvider, default to light
  }

  return (
    <svg
      role="img"
      aria-label="Vinsensius Arko Logo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg brand-logo-${theme} ${className}`.trim()}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    >
      <image
        href="/assets/favicon.png"
        width="64"
        height="64"
        preserveAspectRatio="xMidYMid meet"
        className="brand-logo-img"
      />
    </svg>
  );
}
