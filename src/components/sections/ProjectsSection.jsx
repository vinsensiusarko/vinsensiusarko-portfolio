import { useState, useMemo } from 'react';
import { formatRichDescription } from '../../utils/formatDescription';
import { resolveProjectImage } from '../../utils/resolveProjectImage';
import { ProjectModal } from './ProjectModal';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { trackProjectView } from '../../services/visitorTracker';

const FILTER_CHIPS = [
  { label: 'All Projects', value: 'all', icon: 'fa-solid fa-border-all' },
  { label: 'Mobile App', value: 'Mobile Application', icon: 'fa-solid fa-mobile-screen-button' },
  { label: 'Web App', value: 'Web Application', icon: 'fa-solid fa-laptop-code' },
  { label: 'Web Portal', value: 'Web Portal', icon: 'fa-solid fa-globe' },
  { label: 'Backend API', value: 'Backend API', icon: 'fa-solid fa-server' }
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

export function ProjectsSection({ projects }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleOpenProject = (proj) => {
    setSelectedProject(proj);
    if (proj?.id) {
      trackProjectView(proj.id);
    }
  };

  const filteredProjects = useMemo(() => {
    const trimmed = searchQuery.trim();
    return projects.filter((p) =>
      matchesProjectFilter(p, categoryFilter, trimmed)
    );
  }, [projects, categoryFilter, searchQuery]);

  useScrollReveal('.reveal-on-scroll', [filteredProjects, isExpanded]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setIsExpanded(false);
  };

  return (
    <section id="projects" className="reveal-on-scroll">
      <p className="section__text__p1">Browse My Recent</p>
      <h2 className="title">Projects</h2>

      <div className="project-controls">
        <div className="project-search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            id="project-search-input"
            className="project-search-input"
            placeholder="Search projects by title or tech stack (e.g. Flutter, React, Laravel)..."
            aria-label="Search projects"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsExpanded(false);
            }}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              id="project-search-clear"
              className="project-search-clear"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div
          className="project-filter-chips"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = categoryFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                className={`filter-chip ${isActive ? 'active' : ''}`}
                data-filter={chip.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setCategoryFilter(chip.value);
                  setIsExpanded(false);
                }}
              >
                <i className={chip.icon} aria-hidden="true"></i> {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div id="projects-empty-state" className="projects-empty-state">
          <i className="fa-solid fa-folder-open empty-icon"></i>
          <h3>No matching projects found</h3>
          <p>Try searching for a different keyword or choose another category.</p>
          <button
            type="button"
            className="btn btn-color-2 btn-sm"
            id="reset-filter-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div id="projects-grid" className="projects-grid reveal-stagger">
            {(isExpanded ? filteredProjects : filteredProjects.slice(0, INITIAL_LIMIT)).map((proj, index) => {
            const imgSrc = resolveProjectImage(proj);
            const isComingSoon = Boolean(proj.isComingSoon);
            const isPlayStore =
              proj.demoLabel === 'Play Store' ||
              String(proj.demoUrl || '').includes('play.google.com');
            const techStack = Array.isArray(proj.techStack) ? proj.techStack : [];

            return (
              <article
                key={proj.id || proj.title}
                className="project-card reveal-on-scroll"
                style={{ '--stagger-idx': index % 6 }}
                data-category={proj.category || 'Web Application'}
                data-tech={techStack.join(', ')}
                onClick={(e) => {
                  if (e.target.closest('.project-btn-container a, .project-btn-container button')) {
                    return;
                  }
                  handleOpenProject(proj);
                }}
              >
                <div className="project-img-wrapper" title="Click to view details">
                  <div
                    className="project-img-backdrop"
                    style={{ backgroundImage: `url('${imgSrc}')` }}
                  ></div>
                  <span className="project-card-category-pill">
                    {proj.category || 'Application'}
                  </span>
                  <img
                    src={imgSrc}
                    alt={`${proj.title} preview`}
                    loading="lazy"
                    decoding="async"
                    className="project-img-main"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/portfolio-1.png';
                    }}
                  />
                  <span className="project-quick-view-badge">
                    <i className="fa-solid fa-expand"></i> Quick View
                  </span>
                </div>

                <div className="project-content">
                  <h3 className="project-title">{proj.title}</h3>
                  <div
                    className="project-desc"
                    dangerouslySetInnerHTML={{
                      __html: formatRichDescription(proj.description || '')
                    }}
                  />

                  {techStack.length > 0 && (
                    <div className="project-card-tech-list">
                      {techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="project-card-tech-tag">
                          {tech}
                        </span>
                      ))}
                      {techStack.length > 4 && (
                        <span className="project-card-tech-tag project-card-tech-more">
                          +{techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="project-btn-container">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-color-2 btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fa-brands fa-github"></i> GitHub
                      </a>
                    )}

                    {isComingSoon ? (
                      <span className="badge-coming-soon">
                        <i className="fa-solid fa-clock"></i> Coming Soon
                      </span>
                    ) : proj.demoUrl ? (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-color-1 btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i
                          className={
                            isPlayStore
                              ? 'fa-brands fa-google-play'
                              : 'fa-solid fa-arrow-up-right-from-square'
                          }
                        ></i>{' '}
                        {proj.demoLabel || 'Live Demo'}
                      </a>
                    ) : (
                      !proj.githubUrl && (
                        <span className="badge-coming-soon">
                          <i className="fa-solid fa-clock"></i> Coming Soon
                        </span>
                      )
                    )}

                    <button
                      type="button"
                      className="btn btn-color-2 btn-sm project-detail-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProject(proj);
                      }}
                    >
                      <i className="fa-solid fa-circle-info"></i> Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProjects.length > INITIAL_LIMIT && (
          <div className="projects-show-more-wrapper">
            <button
              type="button"
              className="btn btn-show-more"
              aria-expanded={isExpanded}
              aria-controls="projects-grid"
              onClick={() => {
                if (isExpanded) {
                  setIsExpanded(false);
                  const el = document.getElementById('projects');
                  if (typeof el?.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  setIsExpanded(true);
                }
              }}
            >
              <span>
                {isExpanded
                  ? 'Show Less'
                  : `Show More Projects (${filteredProjects.length - INITIAL_LIMIT} more)`}
              </span>
              <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>
        )}
      </>
      )}

      <div className="arrow">
        <a href="#contact" aria-label="Scroll down to Contact section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
