import { useState, useEffect, useId } from 'react';
import { cn } from 'cn';
import { AnimatePresence, m } from 'motion/react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCircleCheck,
  IconCpu,
  IconBrandGithub,
  IconBrandGooglePlay,
  IconExternalLink,
  IconStack2
} from '@tabler/icons-react';
import { formatRichDescription } from '@/utils/formatDescription';
import { resolveProjectImage } from '@/utils/resolveProjectImage';
import { ResponsivePicture } from '@/components/common/ResponsivePicture';
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
  const modalId = useId();

  useEffect(() => {
    setActiveImageIndex(0);
    setDirection(0);
  }, [project?.id]);

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
        <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
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
              className="relative z-10 h-full w-full"
            >
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
            </m.div>
          </AnimatePresence>

          <Badge
            id="modal-project-category"
            variant="secondary"
            className="absolute top-3 left-3 z-20 gap-1.5 border-border/80 bg-background/90 text-foreground"
          >
            <IconStack2 className="size-3.5" aria-hidden="true" />
            {project.category || 'Project'}
          </Badge>

          {hasGallery && (
            <>
              <span className="absolute right-12 top-3 z-20 rounded-md border border-border bg-background/90 px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                {safeActiveIndex + 1} / {allImages.length}
              </span>
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

          <div
            id="modal-project-desc"
            className="text-sm sm:text-base leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: formatRichDescription(project.description || '')
            }}
          />

          {techList.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconCpu className="size-4 text-season-accent" aria-hidden="true" />
                Technologies Used
              </h4>
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
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm">
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
              <Button asChild size="sm">
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
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
