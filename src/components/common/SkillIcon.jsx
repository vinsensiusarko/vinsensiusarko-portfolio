export function SkillIcon({ skill, size = '1.5rem', className = '' }) {
  const name = String(skill?.name || '').toLowerCase();
  const iconClass = String(skill?.iconClass || '').toLowerCase();
  const isSvg = skill?.iconType === 'svg';

  const isFlutter = name === 'flutter' || iconClass.includes('flutter') || isSvg;

  if (isFlutter) {
    return (
      <svg
        className={`skill-icon skill-icon-svg ${className}`.trim()}
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

  return (
    <i
      className={`${skill?.iconClass || 'fa-solid fa-code'} skill-icon ${className}`.trim()}
      style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
      aria-hidden="true"
    ></i>
  );
}
