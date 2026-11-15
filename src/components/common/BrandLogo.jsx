export function BrandLogo({ size = 28, className = '' }) {
  return (
    <svg
      role="img"
      aria-label="Vinsensius Arko Logo"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`.trim()}
    >
      <defs>
        <linearGradient id="vLogoGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#vLogoGrad)" />
      <path
        d="M13 15L24 35L35 15H29L24 25.5L19 15H13Z"
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
