import { useState, useEffect, useId, useRef } from 'react';
import { cn } from 'cn';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCircleCheck,
  IconCpu,
  IconBrandGithub,
  IconBrandGooglePlay,
  IconExternalLink,
  IconStack2,
  IconDeviceDesktop,
  IconMaximize,
  IconLink,
  IconCheck,
  IconUser,
  IconCalendar
} from '@tabler/icons-react';
import { formatRichDescription } from '@/utils/formatDescription';
import { resolveProjectImage } from '@/utils/resolveProjectImage';
import { ResponsivePicture } from '@/components/common/ResponsivePicture';
import { DeviceFrame, getDeviceVariant } from '@/components/common/DeviceFrame';
import { EDITORIAL_SPRING, GALLERY_SLIDE_VARIANTS } from '@/lib/motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function ProjectModal({ project, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFrame, setShowFrame] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const copiedTimerRef = useRef(null);
  const modalId = useId();

  useEffect(() => {
    setActiveImageIndex(0);
    setDirection(0);
    setShowFrame(true);
    setCopiedLink(false);
    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = null;
    }
  }, [project?.id]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const primaryImg = project ? resolveProjectImage(project) : '';
  const rawGallery = Array.isArray(project?.gallery) ? project.gallery : [];
  const normalizedGallery = rawGallery
    .map((img) => (typeof img === 'string' ? img.trim() : ''))
    .filter(Boolean)
    .map((img) => resolveProjectImage({ image: img }));

  const allImages =
    normalizedGallery.length > 0
      ? Array.from(new Set([primaryImg, ...normalizedGallery]))
      : primaryImg
        ? [primaryImg]
        : [];

  const hasGallery = allImages.length > 1;
  const safeActiveIndex = activeImageIndex < allImages.length ? activeImageIndex : 0;
  const currentImg = allImages[safeActiveIndex] || primaryImg;

  const handlePrev = () => {
    setDirection(-1);
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleCopyLink = async () => {
    if (!project?.id || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?project=${encodeURIComponent(project.id)}`;
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      const container = document.getElementById('project-detail-modal') || document.body;
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      container.appendChild(ta);
      try {
        ta.focus();
        ta.select();
        copied = typeof document.execCommand === 'function' && Boolean(document.execCommand('copy'));
      } catch {
        copied = false;
      } finally {
        if (ta.parentNode) {
          ta.parentNode.removeChild(ta);
        }
      }
    }

    if (copied) {
      setCopiedLink(true);
      toast.success('Project link copied!');
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.error('Could not copy project link.');
    }
  };

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e) => {
      const targetTag = e.target?.tagName?.toLowerCase();
      const isInput =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        e.target?.isContentEditable;
      if (isInput) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (hasGallery && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (hasGallery && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, onClose, hasGallery, allImages.length]);

  if (!project) return null;

  const isComingSoon =
    Boolean(project.isComingSoon) || (!project.demoUrl && !project.githubUrl);
  const techList = Array.isArray(project.techStack) ? project.techStack : [];
  const isPlayStore =
    project.demoLabel === 'Play Store' ||
    String(project.demoUrl || '').includes('play.google.com');
  const deviceVariant = getDeviceVariant(project.category);
  const roleText = String(project.role ?? '').trim();
  const periodText = String(project.period ?? '').trim();
  const highlights = Array.isArray(project.highlights)
    ? project.highlights.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];

  return (
    <Dialog
      open={Boolean(project)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        id="project-detail-modal"
        className="max-h-[90vh] overflow-y-auto p-0 gap-0 sm:max-w-3xl rounded-xl border-border bg-card"
      >
        <div
          className={cn(
            'relative w-full overflow-hidden border-b border-border bg-muted',
            showFrame ? 'min-h-[260px] sm:min-h-[340px]' : 'aspect-video'
          )}
        >
          <div
            id="modal-project-backdrop"
            className="pointer-events-none absolute inset-0 scale-110 overflow-hidden opacity-25 blur-lg"
            aria-hidden="true"
          >
            <ResponsivePicture
              src={currentImg}
              fallbackSrc="/assets/images/portfolio-1.png"
              alt=""
              pictureClassName="block h-full w-full"
              className="h-full w-full object-cover"
            />
          </div>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <m.div
              key={currentImg}
              custom={direction}
              variants={GALLERY_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className={cn(
                'relative z-10 w-full',
                showFrame
                  ? cn(
                      'flex min-h-[260px] sm:min-h-[340px] items-center justify-center pt-16 pb-5 sm:pt-14',
                      hasGallery ? 'px-14 sm:px-16' : 'px-4 sm:px-8'
                    )
                  : 'h-full'
              )}
            >
              {showFrame ? (
                <DeviceFrame
                  variant={deviceVariant}
                  title={project.title}
                  url={project.demoUrl}
                  className={deviceVariant === 'mobile' ? '' : 'max-w-2xl'}
                >
                  <ResponsivePicture
                    id="modal-project-img"
                    src={currentImg}
                    fallbackSrc="/assets/images/portfolio-1.png"
                    alt={`${project.title} preview`}
                    width="960"
                    height="540"
                    pictureClassName="block w-full"
                    className={cn(
                      'w-full object-contain bg-background',
                      deviceVariant === 'mobile'
                        ? 'max-h-[240px] sm:max-h-[280px] p-1'
                        : 'max-h-[230px] sm:max-h-[290px]'
                    )}
                  />
                </DeviceFrame>
              ) : (
                <ResponsivePicture
                  id="modal-project-img"
                  src={currentImg}
                  fallbackSrc="/assets/images/portfolio-1.png"
                  alt={`${project.title} preview`}
                  width="960"
                  height="540"
                  pictureClassName="block h-full w-full"
                  className="h-full w-full object-contain p-3"
                />
              )}
            </m.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-3 pr-15">
            <Badge
              id="modal-project-category"
              variant="secondary"
              className="pointer-events-auto max-w-[52%] truncate gap-1.5 border-border/80 bg-background/90 text-foreground"
            >
              <IconStack2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{project.category || 'Project'}</span>
            </Badge>

            <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
              {hasGallery && (
                <span className="rounded-md border border-border bg-background/90 px-2 py-1 font-mono text-xs font-medium text-foreground">
                  {safeActiveIndex + 1} / {allImages.length}
                </span>
              )}
              <button
                type="button"
                aria-pressed={showFrame}
                aria-label={showFrame ? 'Switch to full preview' : 'Switch to device frame preview'}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFrame((prev) => !prev);
                }}
                className="inline-flex min-h-11 sm:min-h-8 items-center gap-1.5 rounded-md border border-border bg-background/90 px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-season-accent"
              >
                {showFrame ? (
                  <>
                    <IconMaximize className="size-3.5" aria-hidden="true" />
                    <span>Full</span>
                  </>
                ) : (
                  <>
                    <IconDeviceDesktop className="size-3.5" aria-hidden="true" />
                    <span>Frame</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {hasGallery && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-3 z-20 size-11 sm:size-10 -translate-y-1/2 rounded-full shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
              >
                <IconChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-3 z-20 size-11 sm:size-10 -translate-y-1/2 rounded-full shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
              >
                <IconChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>

        {hasGallery && (
          <div
            className="flex items-center gap-2 overflow-x-auto border-b border-border bg-muted/40 px-4 py-2.5"
            role="region"
            aria-label="Image Gallery Thumbnails"
          >
            {allImages.map((img, idx) => {
              const isSelected = idx === safeActiveIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx >= safeActiveIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  aria-label={`View image ${idx + 1} of ${allImages.length}`}
                  className={cn(
                    'relative h-14 w-20 shrink-0 overflow-hidden rounded-md border bg-card transition-opacity',
                    isSelected
                      ? 'border-season-accent opacity-100'
                      : 'border-border opacity-70 hover:opacity-100'
                  )}
                >
                  <ResponsivePicture
                    src={img}
                    fallbackSrc="/assets/images/portfolio-1.png"
                    alt=""
                    width="80"
                    height="56"
                    pictureClassName="block h-full w-full"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <m.span
                      layoutId={`${modalId}-thumb-ring`}
                      transition={EDITORIAL_SPRING}
                      className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset ring-season-accent"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-5 p-6">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0 text-left">
            <div className="flex flex-col gap-1">
              <DialogTitle
                id="modal-project-title"
                className="font-display text-2xl font-bold tracking-tight text-foreground"
              >
                {project.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed preview, tech stack, and links for {project.title}
              </DialogDescription>
            </div>
            <div id="modal-project-status" className="shrink-0">
              {isComingSoon ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-status-warn-border bg-status-warn-bg text-status-warn-fg"
                >
                  <IconClock className="size-3.5" aria-hidden="true" />
                  Coming Soon
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="gap-1 border-status-success-border bg-status-success-bg text-status-success-fg"
                >
                  <IconCircleCheck className="size-3.5" aria-hidden="true" />
                  Live Project
                </Badge>
              )}
            </div>
          </DialogHeader>

          {(roleText || periodText) && (
            <div
              id="modal-project-case-meta"
              className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground"
            >
              {roleText && (
                <div className="inline-flex items-center gap-1.5">
                  <IconUser className="size-3.5 text-season-accent" aria-hidden="true" />
                  <span className="font-medium text-foreground">Role:</span>
                  <span>{roleText}</span>
                </div>
              )}
              {periodText && (
                <div className="inline-flex items-center gap-1.5">
                  <IconCalendar className="size-3.5 text-season-accent" aria-hidden="true" />
                  <span className="font-medium text-foreground">Period:</span>
                  <span className="font-mono tabular-nums">{periodText}</span>
                </div>
              )}
            </div>
          )}

          <div
            id="modal-project-desc"
            className="text-sm sm:text-base leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: formatRichDescription(project.description || '')
            }}
          />

          {highlights.length > 0 && (
            <div className="flex flex-col gap-2.5" id="modal-project-highlights">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconCircleCheck className="size-4 text-season-accent" aria-hidden="true" />
                Key Highlights
              </h3>
              <ul className="flex flex-col gap-2">
                {highlights.map((item, idx) => (
                  <li
                    key={`${idx}-${item}`}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
                  >
                    <IconCircleCheck
                      className="mt-0.5 size-4 shrink-0 text-season-accent"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {techList.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconCpu className="size-4 text-season-accent" aria-hidden="true" />
                Technologies Used
              </h3>
              <div id="modal-project-tech-list" className="flex flex-wrap gap-1.5">
                {techList.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div
            className="flex flex-wrap items-center justify-end gap-2"
            id="modal-project-actions"
          >
            {project.id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="mr-auto min-h-11 sm:min-h-9"
              >
                {copiedLink ? (
                  <IconCheck data-icon="inline-start" aria-hidden="true" />
                ) : (
                  <IconLink data-icon="inline-start" aria-hidden="true" />
                )}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandGithub data-icon="inline-start" aria-hidden="true" />
                  GitHub Repository
                </a>
              </Button>
            )}
            {!project.isComingSoon && project.demoUrl && (
              <Button asChild size="sm" className="min-h-11 sm:min-h-9">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isPlayStore ? (
                    <IconBrandGooglePlay data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <IconExternalLink data-icon="inline-start" aria-hidden="true" />
                  )}
                  {project.demoLabel || 'Live Demo'}
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-9"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
