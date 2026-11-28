import { useState, useMemo, useEffect, useRef, useId } from 'react';
import { cn } from 'cn';
import { AnimatePresence, m } from 'motion/react';
import {
  IconLayoutGrid,
  IconDeviceMobile,
  IconDeviceLaptop,
  IconWorld,
  IconServer,
  IconSearch,
  IconX,
  IconFolderOff,
  IconBrandGithub,
  IconBrandGooglePlay,
  IconExternalLink,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconMaximize
} from '@tabler/icons-react';
import { formatRichDescription } from '@/utils/formatDescription';
import { resolveProjectImage } from '@/utils/resolveProjectImage';
import { ResponsivePicture } from '@/components/common/ResponsivePicture';
import { ParallaxLayer, SectionWatermark } from '@/components/common/ParallaxLayer';
import { EDITORIAL_EASE, EDITORIAL_SPRING, TACTILE_SPRING } from '@/lib/motion';
import { ProjectModal } from './ProjectModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { trackProjectView } from '@/services/visitorTracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const FILTER_CHIPS = [
  { label: 'All Projects', value: 'all', Icon: IconLayoutGrid },
  { label: 'Mobile App', value: 'Mobile Application', Icon: IconDeviceMobile },
  { label: 'Web App', value: 'Web Application', Icon: IconDeviceLaptop },
  { label: 'Web Portal', value: 'Web Portal', Icon: IconWorld },
  { label: 'Backend API', value: 'Backend API', Icon: IconServer }
];

function matchesProjectFilter(project, categoryFilter, searchQuery) {
  const category = String(project.category || '').toLowerCase();
  const tech = (project.techStack || []).join(', ').toLowerCase();
  const title = String(project.title || '').toLowerCase();
  const desc = String(project.description || '').toLowerCase();

  let matchesCategory = false;
  if (categoryFilter === 'all') {
    matchesCategory = true;
  } else {
    const targetFilter = categoryFilter.toLowerCase();
    matchesCategory = category.includes(targetFilter);
    if (!matchesCategory) {
      if (
        targetFilter.includes('mobile') &&
        (category.includes('mobile') || tech.includes('flutter'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('web application') &&
        (category.includes('web application') || category.includes('enterprise'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('web portal') &&
        (category.includes('portal') ||
          tech.includes('wordpress') ||
          tech.includes('laravel'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('backend') &&
        (category.includes('backend') ||
          tech.includes('node') ||
          tech.includes('express'))
      ) {
        matchesCategory = true;
      }
    }
  }

  let matchesSearch = true;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    matchesSearch =
      title.includes(q) ||
      tech.includes(q) ||
      desc.includes(q) ||
      category.includes(q);
  }

  return matchesCategory && matchesSearch;
}

const INITIAL_LIMIT = 6;

function syncProjectUrlParam(projectId) {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  try {
    const url = new URL(window.location.href);
    if (projectId) {
      url.searchParams.set('project', projectId);
    } else {
      url.searchParams.delete('project');
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  } catch {
    // ignore invalid url contexts in tests
  }
}

export function ProjectsSection({ projects, sectionIndex = '04' }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const isFirstMountRef = useRef(true);
  const handledDeepLinkRef = useRef(null);
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const sectionId = useId();
  const panelId = `${sectionId}-panel`;

  const handleFilterTabKeyDown = (e, currentIndex) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % FILTER_CHIPS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + FILTER_CHIPS.length) % FILTER_CHIPS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = FILTER_CHIPS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setCategoryFilter(FILTER_CHIPS[nextIndex].value);
      setIsExpanded(false);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !Array.isArray(projects) || projects.length === 0) {
      return;
    }
    const targetId = new URLSearchParams(window.location.search).get('project');
    if (!targetId || handledDeepLinkRef.current === targetId) return;

    const matched = projects.find((p) => p.id === targetId);
    if (matched) {
      handledDeepLinkRef.current = targetId;
      setSelectedProject(matched);
      trackProjectView(matched.id);
    }
  }, [projects]);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (!isExpanded) {
      const targetEl =
        document.getElementById('projects') ||
        document.getElementById('projects-grid');
      if (targetEl) {
        const headerOffset = 88;
        const elementPosition = targetEl.getBoundingClientRect?.()?.top ?? 0;
        const offsetPosition =
          elementPosition + (window.pageYOffset || window.scrollY || 0) - headerOffset;
        if (typeof window?.scrollTo === 'function') {
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [isExpanded]);

  const handleOpenProject = (proj) => {
    setSelectedProject(proj);
    if (proj?.id) {
      handledDeepLinkRef.current = proj.id;
      syncProjectUrlParam(proj.id);
      trackProjectView(proj.id);
    }
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    syncProjectUrlParam(null);
  };

  const activeProject = useMemo(() => {
    if (!selectedProject) return null;
    if (!selectedProject.id || !Array.isArray(projects)) return selectedProject;
    return projects.find((p) => p.id === selectedProject.id) || selectedProject;
  }, [selectedProject, projects]);

  const filteredProjects = useMemo(() => {
    const trimmed = searchQuery.trim();
    return (projects || []).filter((p) =>
      matchesProjectFilter(p, categoryFilter, trimmed)
    );
  }, [projects, categoryFilter, searchQuery]);

  useScrollReveal('.reveal-on-scroll', [filteredProjects, isExpanded]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setIsExpanded(false);
  };

  const visibleProjects = isExpanded
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_LIMIT);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="reveal-on-scroll relative z-10 mx-auto max-w-6xl overflow-x-clip px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
    >
      <SectionWatermark targetRef={sectionRef} label={sectionIndex} align="right" />

      <ParallaxLayer
        targetRef={sectionRef}
        offset={-12}
        mobileFactor={0}
        className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs uppercase tracking-wider text-season-foreground">
            Selected Work
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Projects
          </h2>
        </div>

        <div className="w-full lg:max-w-sm">
          <label
            htmlFor="project-search-input"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Search projects
          </label>
          <div className="relative">
            <IconSearch
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              id="project-search-input"
              placeholder="Search projects by title or tech stack..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsExpanded(false);
              }}
              className="h-11 sm:h-10 pl-9 pr-11"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                id="project-search-clear"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-0 flex size-11 sm:size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconX className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </ParallaxLayer>

      <div
        className="relative z-10 mt-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filter projects by category"
      >
        {FILTER_CHIPS.map(({ label, value, Icon }, idx) => {
          const isActive = categoryFilter === value;
          return (
            <button
              key={value}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={`${sectionId}-tab-${value}`}
              type="button"
              className={cn(
                'filter-chip relative inline-flex min-h-11 sm:min-h-10 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-season-accent',
                isActive
                  ? 'active border-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
              data-filter={value}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => {
                setCategoryFilter(value);
                setIsExpanded(false);
              }}
              onKeyDown={(e) => handleFilterTabKeyDown(e, idx)}
            >
              {isActive && (
                <m.span
                  layoutId={`${sectionId}-filter-pill`}
                  transition={EDITORIAL_SPRING}
                  className="absolute inset-0 rounded-[7px] bg-primary"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${sectionId}-tab-${categoryFilter}`}
      >
      {filteredProjects.length === 0 ? (
        <m.div
          key="projects-empty-state"
          id="projects-empty-state"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: EDITORIAL_EASE }}
          className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <IconFolderOff className="size-6" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            No matching projects found
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Try searching for a different keyword or choose another category.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            id="reset-filter-btn"
            onClick={resetFilters}
            className="mt-1"
          >
            Reset Filters
          </Button>
        </m.div>
      ) : (
        <>
          <div
            id="projects-grid"
            className="projects-grid reveal-stagger relative mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout" initial={false}>
            {visibleProjects.map((proj, index) => {
              const imgSrc = resolveProjectImage(proj);
              const isComingSoon = Boolean(proj.isComingSoon);
              const isPlayStore =
                proj.demoLabel === 'Play Store' ||
                String(proj.demoUrl || '').includes('play.google.com');
              const techStack = Array.isArray(proj.techStack) ? proj.techStack : [];

              return (
                <m.article
                  key={proj.id || proj.title}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    layout: EDITORIAL_SPRING,
                    y: TACTILE_SPRING,
                    scale: TACTILE_SPRING,
                    opacity: { duration: 0.16, ease: EDITORIAL_EASE }
                  }}
                  tabIndex={0}
                  aria-label={`View details for ${proj.title}`}
                  className="project-card reveal-on-scroll group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-foreground/25 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-season-accent"
                  style={{ '--stagger-idx': index % 6 }}
                  data-category={proj.category || 'Web Application'}
                  data-tech={techStack.join(', ')}
                  onClick={(e) => {
                    if (
                      e.target.closest('.project-btn-container a, .project-btn-container button')
                    ) {
                      return;
                    }
                    handleOpenProject(proj);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.target.closest('.project-btn-container a, .project-btn-container button')
                    ) {
                      return;
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenProject(proj);
                    }
                  }}
                >
                  <div
                    className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted"
                    title="Click to view details"
                  >
                    <ResponsivePicture
                      src={imgSrc}
                      fallbackSrc="/assets/images/portfolio-1.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      pictureAriaHidden="true"
                      pictureClassName="pointer-events-none absolute inset-0 block scale-110 opacity-25 blur-md"
                      className="h-full w-full object-cover"
                    />
                    <ResponsivePicture
                      src={imgSrc}
                      fallbackSrc="/assets/images/portfolio-1.png"
                      alt={`${proj.title} preview`}
                      width="480"
                      height="300"
                      loading="lazy"
                      decoding="async"
                      pictureClassName="relative z-10 block h-full w-full"
                      className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-3 left-3 z-20 border-border/80 bg-background/90 text-foreground"
                    >
                      {proj.category || 'Application'}
                    </Badge>
                    <span className="pointer-events-none absolute right-3 bottom-3 z-20 inline-flex items-center gap-1 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <IconMaximize className="size-3" aria-hidden="true" />
                      Quick View
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                      {proj.title}
                    </h3>

                    <div
                      className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: formatRichDescription(proj.description || '')
                      }}
                    />

                    {techStack.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[11px] font-normal">
                            {tech}
                          </Badge>
                        ))}
                        {techStack.length > 4 && (
                          <Badge variant="outline" className="font-mono text-[11px]">
                            +{techStack.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="project-btn-container flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
                      {proj.githubUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconBrandGithub data-icon="inline-start" aria-hidden="true" />
                            GitHub
                          </a>
                        </Button>
                      )}

                      {isComingSoon ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-status-warn-border bg-status-warn-bg text-status-warn-fg"
                        >
                          <IconClock className="size-3" aria-hidden="true" />
                          Coming Soon
                        </Badge>
                      ) : proj.demoUrl ? (
                        <Button asChild size="sm">
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isPlayStore ? (
                              <IconBrandGooglePlay data-icon="inline-start" aria-hidden="true" />
                            ) : (
                              <IconExternalLink data-icon="inline-start" aria-hidden="true" />
                            )}
                            {proj.demoLabel || 'Live Demo'}
                          </a>
                        </Button>
                      ) : (
                        !proj.githubUrl && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-status-warn-border bg-status-warn-bg text-status-warn-fg"
                          >
                            <IconClock className="size-3" aria-hidden="true" />
                            Coming Soon
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </m.article>
              );
            })}
            </AnimatePresence>
          </div>

          {filteredProjects.length > INITIAL_LIMIT && (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                aria-expanded={isExpanded}
                aria-controls="projects-grid"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="min-h-11"
              >
                <span>
                  {isExpanded
                    ? 'Show Less'
                    : `Show More Projects (${filteredProjects.length - INITIAL_LIMIT} more)`}
                </span>
                {isExpanded ? (
                  <IconChevronUp data-icon="inline-end" aria-hidden="true" />
                ) : (
                  <IconChevronDown data-icon="inline-end" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        </>
      )}
      </div>

      <ProjectModal
        project={activeProject}
        onClose={handleCloseProject}
      />
    </section>
  );
}
