import { useEffect, useRef } from 'react';
import { useSeason } from '../../context/SeasonContext';
import { useTheme } from '../../context/ThemeContext';

function createParticle(width, height, season) {
  const colors = {
    spring: ['#f9a8d4', '#f472b6', '#fbcfe8'],
    summer: ['#fde047', '#f59e0b', '#fef08a'],
    autumn: ['#ea580c', '#d97706', '#b45309', '#dc2626'],
    winter: ['#bae6fd', '#7dd3fc', '#e0f2fe', '#ffffff']
  }[season] || ['#f9a8d4'];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const depth = 0.35 + Math.random() * 0.65;

  if (season === 'spring') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 6,
      speedY: 0.6 + Math.random() * 0.8,
      speedX: 0.3 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.55 + Math.random() * 0.3,
      depth,
      color
    };
  }

  if (season === 'summer') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2.5 + Math.random() * 4.5,
      speedY: -0.25 - Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.35 + Math.random() * 0.45,
      depth,
      color
    };
  }

  if (season === 'autumn') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 8 + Math.random() * 7,
      speedY: 0.75 + Math.random() * 1.0,
      speedX: 0.4 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.3,
      depth,
      color
    };
  }

  // winter
  const snowDepth = 0.4 + Math.random() * 0.6;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: (2 + Math.random() * 3.5) * snowDepth,
    speedY: (0.5 + Math.random() * 0.9) * snowDepth,
    speedX: (Math.random() - 0.5) * 0.4,
    swayOffset: Math.random() * Math.PI * 2,
    opacity: 0.4 + snowDepth * 0.45,
    depth: snowDepth,
    color
  };
}

function drawPetal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    -p.size * 0.5,
    -p.size * 0.6,
    -p.size,
    p.size * 0.3,
    0,
    p.size
  );
  ctx.bezierCurveTo(
    p.size,
    p.size * 0.3,
    p.size * 0.5,
    -p.size * 0.6,
    0,
    0
  );
  ctx.fill();
  ctx.restore();
}

function drawFirefly(ctx, p, isDark) {
  ctx.save();
  const alpha = p.opacity * (0.55 + 0.45 * Math.sin(p.pulse));
  ctx.globalAlpha = Math.max(0.1, alpha);
  const radius = p.size * (isDark ? 2.4 : 2.0);
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
  grad.addColorStop(0, p.color);
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMapleLeaf(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  const s = p.size * 0.6;
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.5, -s * 0.3);
  ctx.lineTo(s, -s * 0.2);
  ctx.lineTo(s * 0.4, s * 0.3);
  ctx.lineTo(s * 0.6, s);
  ctx.lineTo(0, s * 0.5);
  ctx.lineTo(-s * 0.6, s);
  ctx.lineTo(-s * 0.4, s * 0.3);
  ctx.lineTo(-s, -s * 0.2);
  ctx.lineTo(-s * 0.5, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(ctx, p, isDark) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = isDark ? p.color : '#38bdf8';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function SeasonalCanvas() {
  const canvasRef = useRef(null);
  const { season, particlesEnabled, seasonMeta } = useSeason();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !particlesEnabled) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const count = isMobile
      ? seasonMeta.particleCountMobile
      : seasonMeta.particleCountDesktop;

    const particles = Array.from({ length: count }, () =>
      createParticle(width, height, season)
    );

    let tick = 0;
    let lastScrollY = window.scrollY || 0;
    let scrollImpulse = 0;

    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      const delta = Math.max(-80, Math.min(80, currentY - lastScrollY));
      lastScrollY = currentY;
      scrollImpulse = Math.max(-60, Math.min(60, scrollImpulse + delta * 0.18));
    };

    const renderLoop = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      tick += 0.015;
      ctx.clearRect(0, 0, width, height);
      const isDark = theme === 'dark';
      const hasScrollImpulse = Math.abs(scrollImpulse) > 0.05;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (hasScrollImpulse) {
          p.y -= scrollImpulse * (0.12 + (p.depth || 0.5) * 0.24);
          if (p.y < -24) p.y = height + 16;
          if (p.y > height + 24) p.y = -16;
        }

        if (season === 'spring') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick + p.swayOffset) * 0.45;
          p.angle += p.spin;
          if (p.y > height + 20) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -15;
          drawPetal(ctx, p);
        } else if (season === 'summer') {
          p.y += p.speedY;
          p.x += p.speedX + Math.cos(tick + p.pulse) * 0.2;
          p.pulse += p.pulseSpeed;
          if (p.y < -20) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 15;
          if (p.x > width + 20) p.x = -15;
          drawFirefly(ctx, p, isDark);
        } else if (season === 'autumn') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick * 1.2 + p.swayOffset) * 0.7;
          p.angle += p.spin;
          if (p.y > height + 20) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -15;
          drawMapleLeaf(ctx, p);
        } else {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick + p.swayOffset) * 0.35;
          if (p.y > height + 15) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 15) p.x = -10;
          if (p.x < -15) p.x = width + 10;
          drawSnowflake(ctx, p, isDark);
        }
      }

      if (hasScrollImpulse) {
        scrollImpulse *= 0.86;
      } else {
        scrollImpulse = 0;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [season, particlesEnabled, seasonMeta, theme]);

  if (!particlesEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="seasonal-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.55,
        zIndex: 1
      }}
    />
  );
}
