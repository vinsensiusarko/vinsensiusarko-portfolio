/**
 * Custom SEO OpenGraph Image Generator Engine (HTML5 Canvas 1200x630)
 * Generates pixel-perfect social share banners for WhatsApp, Twitter/X, LinkedIn, Discord.
 * Zero external runtime dependencies.
 */

export const OG_THEMES = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Indigo',
    bg1: '#0a0e1a',
    bg2: '#1e1b4b',
    glow1: 'rgba(99, 102, 241, 0.35)',
    glow2: 'rgba(56, 189, 248, 0.25)',
    accent: '#818cf8',
    accentLight: '#c7d2fe',
    titleColor: '#ffffff',
    textColor: '#cbd5e1',
    mutedColor: '#94a3b8',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeBorder: 'rgba(99, 102, 241, 0.45)',
    badgeText: '#e0e7ff',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    pillText: '#f8fafc'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Navy',
    bg1: '#030712',
    bg2: '#082f49',
    glow1: 'rgba(14, 165, 233, 0.35)',
    glow2: 'rgba(34, 211, 238, 0.25)',
    accent: '#38bdf8',
    accentLight: '#bae6fd',
    titleColor: '#ffffff',
    textColor: '#cbd5e1',
    mutedColor: '#94a3b8',
    badgeBg: 'rgba(14, 165, 233, 0.2)',
    badgeBorder: 'rgba(14, 165, 233, 0.45)',
    badgeText: '#e0f2fe',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    pillText: '#f8fafc'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Plum',
    bg1: '#18181b',
    bg2: '#4c0519',
    glow1: 'rgba(244, 63, 94, 0.35)',
    glow2: 'rgba(251, 146, 60, 0.25)',
    accent: '#fb7185',
    accentLight: '#fecdd3',
    titleColor: '#ffffff',
    textColor: '#f4f4f5',
    mutedColor: '#a1a1aa',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    badgeBorder: 'rgba(244, 63, 94, 0.45)',
    badgeText: '#ffe4e6',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    pillText: '#ffffff'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Aurora',
    bg1: '#022c22',
    bg2: '#064e3b',
    glow1: 'rgba(16, 185, 129, 0.35)',
    glow2: 'rgba(45, 212, 191, 0.25)',
    accent: '#34d399',
    accentLight: '#a7f3d0',
    titleColor: '#f0fdf4',
    textColor: '#d1fae5',
    mutedColor: '#6ee7b7',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeBorder: 'rgba(16, 185, 129, 0.45)',
    badgeText: '#d1fae5',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    pillText: '#f0fdf4'
  },
  light: {
    id: 'light',
    name: 'Studio Minimal',
    bg1: '#ffffff',
    bg2: '#f1f5f9',
    glow1: 'rgba(59, 130, 246, 0.15)',
    glow2: 'rgba(99, 102, 241, 0.12)',
    accent: '#2563eb',
    accentLight: '#1d4ed8',
    titleColor: '#0f172a',
    textColor: '#334155',
    mutedColor: '#64748b',
    badgeBg: 'rgba(37, 99, 235, 0.08)',
    badgeBorder: 'rgba(37, 99, 235, 0.25)',
    badgeText: '#1e40af',
    pillBg: 'rgba(0, 0, 0, 0.04)',
    pillBorder: 'rgba(0, 0, 0, 0.12)',
    pillText: '#1e293b'
  }
};

/**
 * Draw rounded rectangle helper
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw the origami monogram "V"
 */
function drawOrigamiV(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 64;
  ctx.scale(scale, scale);
  ctx.fillStyle = color;

  // Exact geometric path matching favicon monogram
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(24, 4);
  ctx.lineTo(39, 31);
  ctx.lineTo(50, 14);
  ctx.lineTo(50, 12);
  ctx.lineTo(45, 12);
  ctx.lineTo(39, 22);
  ctx.lineTo(35, 16);
  ctx.lineTo(35, 13);
  ctx.lineTo(40, 4);
  ctx.lineTo(64, 4);
  ctx.lineTo(40, 47);
  ctx.lineTo(37, 45);
  ctx.lineTo(20, 13);
  ctx.lineTo(14, 12);
  ctx.lineTo(36, 50);
  ctx.lineTo(36, 54);
  ctx.lineTo(33, 59);
  ctx.lineTo(29, 56);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Render OpenGraph 1200x630 banner on an HTML5 canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @returns {Promise<string>} dataUrl
 */
export async function renderOgBanner(canvas, options = {}) {
  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx || typeof ctx.createLinearGradient !== 'function') {
    try {
      try {
    return canvas.toDataURL ? canvas.toDataURL('image/png') : '';
  } catch {
    return '';
  }
    } catch {
      return '';
    }
  }

  const theme = OG_THEMES[options.theme] || OG_THEMES.cyber;
  const title = options.title || 'Vinsensius Arka';
  const role = options.role || 'Web & Mobile Developer';
  const description =
    options.description ||
    'Building responsive web applications and cross-platform mobile solutions with Flutter, React, Laravel, and modern tech.';
  const website = options.website || 'vinsensiusarka.id';
  const techStack = (
    options.techStack || 'Flutter, React, Laravel, Node.js, Java, MySQL'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const avatarImageSrc = options.avatarImage || null;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.bg1);
  bgGrad.addColorStop(1, theme.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Radial Glow Spheres
  const glow1 = ctx.createRadialGradient(250, 150, 20, 250, 150, 400);
  glow1.addColorStop(0, theme.glow1);
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(980, 480, 20, 980, 480, 450);
  glow2.addColorStop(0, theme.glow2);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle grid lines overlay
  ctx.strokeStyle =
    theme.id === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 4. Outer decorative glowing border
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 20);
  ctx.strokeStyle =
    theme.id === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 5. Header Brand & Badge
  const headerY = 70;
  // Monogram Logo
  drawOrigamiV(ctx, 64, headerY, 44, theme.accent);

  // Brand Name
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.titleColor;
  ctx.textAlign = 'left';
  ctx.fillText('Arko Portfolio', 124, headerY + 30);

  // Status pill badge (top right)
  const statusX = width - 340;
  const statusY = headerY + 4;
  drawRoundedRect(ctx, statusX, statusY, 276, 38, 19);
  ctx.fillStyle = theme.badgeBg;
  ctx.fill();
  ctx.strokeStyle = theme.badgeBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Green active pulse dot
  ctx.beginPath();
  ctx.arc(statusX + 22, statusY + 19, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();

  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.badgeText;
  ctx.fillText('VERIFIED DEVELOPER PORTFOLIO', statusX + 36, statusY + 24);

  // Determine layout width based on whether avatar is shown
  const hasAvatar = Boolean(avatarImageSrc);
  const contentWidth = hasAvatar ? 680 : 1060;

  // 6. Main Title (Name)
  const titleY = 200;
  ctx.font = '800 64px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.titleColor;
  ctx.fillText(title, 64, titleY);

  // 7. Role / Subtitle
  const roleY = titleY + 54;
  ctx.font = '600 32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText(role, 64, roleY);

  // 8. Description / Tagline (wrapped lines)
  const descY = roleY + 44;
  ctx.font = '400 21px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.textColor;

  const words = description.split(' ');
  let line = '';
  let lineY = descY;
  const maxLineLength = contentWidth;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineLength && i > 0) {
      ctx.fillText(line, 64, lineY);
      line = words[i] + ' ';
      lineY += 30;
      if (lineY > descY + 60) break; // limit to 2 lines
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 64, lineY);

  // 9. Tech Stack Pill Badges
  const badgeStartY = Math.max(lineY + 44, 400);
  let currentBadgeX = 64;
  const badgeHeight = 36;

  techStack.slice(0, 6).forEach((tech) => {
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(tech).width;
    const badgeWidth = textWidth + 30;

    if (currentBadgeX + badgeWidth > contentWidth + 60) return;

    drawRoundedRect(
      ctx,
      currentBadgeX,
      badgeStartY,
      badgeWidth,
      badgeHeight,
      18
    );
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = theme.pillText;
    ctx.fillText(tech, currentBadgeX + 15, badgeStartY + 24);

    currentBadgeX += badgeWidth + 12;
  });

  // 10. Footer info bar
  const footerY = 560;
  ctx.beginPath();
  ctx.moveTo(64, footerY - 24);
  ctx.lineTo(width - 64, footerY - 24);
  ctx.strokeStyle =
    theme.id === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Globe icon circle
  ctx.beginPath();
  ctx.arc(80, footerY + 6, 12, 0, Math.PI * 2);
  ctx.fillStyle = theme.badgeBg;
  ctx.fill();

  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.titleColor;
  ctx.fillText(website, 104, footerY + 12);

  // Additional footer note
  ctx.font = '500 16px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = theme.mutedColor;
  ctx.textAlign = 'right';
  ctx.fillText('Google Play Store • GitHub • LinkedIn', width - 64, footerY + 12);
  ctx.textAlign = 'left';

  // 11. Profile Photo Avatar (if present)
  if (hasAvatar) {
    try {
      const avatarImg = await loadImage(avatarImageSrc);
      const avatarCenterX = 980;
      const avatarCenterY = 320;
      const avatarRadius = 120;

      // Glow behind avatar
      const avatarGlow = ctx.createRadialGradient(
        avatarCenterX,
        avatarCenterY,
        avatarRadius - 10,
        avatarCenterX,
        avatarCenterY,
        avatarRadius + 40
      );
      avatarGlow.addColorStop(0, theme.accent);
      avatarGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = avatarGlow;
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Outer border circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        avatarImg,
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();

      // Ring stroke
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 4;
      ctx.stroke();
    } catch (err) {
      console.warn('Could not load avatar for OG banner:', err);
    }
  }

  try {
    return canvas.toDataURL ? canvas.toDataURL('image/png') : '';
  } catch {
    return '';
  }
}

/**
 * Helper to safely load an image URL into an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('No src provided'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
