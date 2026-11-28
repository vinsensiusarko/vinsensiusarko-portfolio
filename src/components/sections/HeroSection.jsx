import { useState, useEffect, useRef } from 'react';
import { m } from 'motion/react';
import {
  IconDownload,
  IconSend,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandInstagram,
  IconMail
} from '@tabler/icons-react';
import { useSeason } from '@/context/SeasonContext';
import { trackCvDownload } from '@/services/visitorTracker';
import {
  EDITORIAL_EASE,
  HERO_CONTAINER_VARIANTS,
  HERO_ITEM_VARIANTS
} from '@/lib/motion';
import { ResponsivePicture } from '@/components/common/ResponsivePicture';
import { AvailabilityBadge } from '@/components/common/AvailabilityBadge';
import { ParallaxLayer } from '@/components/common/ParallaxLayer';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

const DEFAULT_ROLES = ['Web Developer', 'Mobile Developer'];

export function HeroSection({ siteSettings = {}, contactSettings = {} }) {
  const { seasonMeta } = useSeason();
  const roles =
    Array.isArray(siteSettings.typewriterRoles) &&
    siteSettings.typewriterRoles.length > 0
      ? siteSettings.typewriterRoles
      : DEFAULT_ROLES;

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState(roles[0] || 'Web Developer');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex % roles.length];
    const isPauseAtEnd = !isDeleting && displayText === currentRole;
    const isPauseAtEmpty = isDeleting && displayText === '';
    const delay = isPauseAtEnd ? 1800 : isPauseAtEmpty ? 350 : isDeleting ? 40 : 85;

    const timer = setTimeout(() => {
      if (isPauseAtEnd) {
        setIsDeleting(true);
      } else if (isPauseAtEmpty) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        setDisplayText(
          currentRole.substring(0, displayText.length + (isDeleting ? -1 : 1))
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  const cvHref =
    siteSettings.cvBase64 ||
    siteSettings.cvUrl ||
    '/assets/docs/cv-vinsensiusarka.pdf';
  const isBase64Cv = Boolean(siteSettings.cvBase64);

  const socialLinks = [
    {
      label: 'LinkedIn Profile',
      tooltip: 'LinkedIn',
      href: contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/',
      external: true,
      Icon: IconBrandLinkedin
    },
    {
      label: 'GitHub Profile',
      tooltip: 'GitHub',
      href: contactSettings.github || 'https://github.com/vinsensiusarko',
      external: true,
      Icon: IconBrandGithub
    },
    {
      label: 'Instagram Profile',
      tooltip: 'Instagram',
      href: contactSettings.instagram || 'https://www.instagram.com/vinsensiusarko/',
      external: true,
      Icon: IconBrandInstagram
    },
    {
      label: 'Send Email',
      tooltip: 'Email Me',
      href: `mailto:${contactSettings.email || 'me@vinsensiusarka.id'}`,
      external: false,
      Icon: IconMail
    }
  ];

  const heroImgSrc = siteSettings.heroImage || '/assets/images/arko-pic.jpg';
  const sectionRef = useRef(null);

  return (
      <section
        ref={sectionRef}
        id="profile"
        className="relative z-10 mx-auto max-w-6xl overflow-x-clip px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-20 lg:pb-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <ParallaxLayer
            targetRef={sectionRef}
            range={[0, 18]}
            scrollOffset={['start start', 'end start']}
            mobileFactor={0.35}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <m.div
              variants={HERO_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-5"
            >
            <m.div
              variants={HERO_ITEM_VARIANTS}
              className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {siteSettings.heroGreeting || "Hello, I'm"}
              </span>
              <span className="h-3.5 w-px bg-border" aria-hidden="true" />
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono text-season-foreground"
                aria-label={`Active season: ${seasonMeta.labelEn}`}
              >
                <span
                  className="size-2 rounded-full bg-season-accent"
                  aria-hidden="true"
                />
                {seasonMeta.labelEn} Edition
              </span>
              <AvailabilityBadge
                status={siteSettings.availabilityStatus}
                text={siteSettings.availabilityText}
              />
            </m.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              {siteSettings.name || 'Vinsensius Arka'}
            </h1>

            <m.p
              variants={HERO_ITEM_VARIANTS}
              className="text-xl sm:text-2xl font-medium text-muted-foreground min-h-8"
            >
              <span className="typeWriter">{displayText || '\u00A0'}</span>
              <span className="typewriter-cursor" aria-hidden="true">
                |
              </span>
            </m.p>

            <m.p
              variants={HERO_ITEM_VARIANTS}
              className="max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground"
            >
              Building reliable cross-platform mobile apps with Flutter and full-stack web
              applications with Laravel, Java, and modern React.
            </m.p>

            <m.div
              variants={HERO_ITEM_VARIANTS}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Button asChild size="lg" className="min-h-11">
                <a
                  href={cvHref}
                  download={
                    isBase64Cv || cvHref.endsWith('.pdf')
                      ? siteSettings.cvFileName || 'CV-VinsensiusArka.pdf'
                      : undefined
                  }
                  target={
                    !isBase64Cv && cvHref.startsWith('http') ? '_blank' : undefined
                  }
                  rel={
                    !isBase64Cv && cvHref.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  onClick={() => trackCvDownload()}
                >
                  <IconDownload data-icon="inline-start" aria-hidden="true" />
                  Download CV
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="min-h-11">
                <a href="#contact">
                  <IconSend data-icon="inline-start" aria-hidden="true" />
                  Contact Info
                </a>
              </Button>
            </m.div>

            <m.div
              variants={HERO_ITEM_VARIANTS}
              id="socials-container"
              className="flex items-center gap-1.5 pt-2"
              aria-label="Social links"
            >
              {socialLinks.map(({ label, tooltip, href, external, Icon }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-11 text-muted-foreground hover:text-foreground"
                    >
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        aria-label={label}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </m.div>
            </m.div>
          </ParallaxLayer>

          <ParallaxLayer
            targetRef={sectionRef}
            range={[0, -36]}
            scaleRange={[1, 1.035]}
            scrollOffset={['start start', 'end start']}
            mobileFactor={0.4}
            className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <m.div
              initial={{ scale: 0.985 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
              className="relative w-full max-w-70 sm:max-w-85 lg:max-w-95 rounded-2xl border border-border bg-card p-2.5 shadow-sm"
            >
              <ParallaxLayer
                targetRef={sectionRef}
                range={[0, -24]}
                scrollOffset={['start start', 'end start']}
                mobileFactor={0.4}
                className="pointer-events-none absolute -right-2 -bottom-2 z-20"
              >
                <div
                  className="h-16 w-16 rounded-br-2xl border-r-2 border-b-2 border-season-accent"
                  aria-hidden="true"
                />
              </ParallaxLayer>
              <ResponsivePicture
                id="hero-img"
                src={heroImgSrc}
                fallbackSrc="/assets/images/arko-pic.jpg"
                alt={`Portrait of ${siteSettings.name || 'Vinsensius Arka'}`}
                width="380"
                height="380"
                fetchPriority="high"
                decoding="async"
                className="aspect-square w-full rounded-xl object-cover bg-muted"
              />
            </m.div>
          </ParallaxLayer>
        </div>
      </section>
  );
}
