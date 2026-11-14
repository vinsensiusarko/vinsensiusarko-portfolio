import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatRichDescription } from '../../utils/formatDescription';
import { resolveProjectImage } from '../../utils/resolveProjectImage';

export function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const imgSrc = resolveProjectImage(project);
  const isComingSoon =
    Boolean(project.isComingSoon) || (!project.demoUrl && !project.githubUrl);
  const techList = Array.isArray(project.techStack) ? project.techStack : [];
  const isPlayStore =
    project.demoLabel === 'Play Store' ||
    String(project.demoUrl || '').includes('play.google.com');

  const modalNode = (
    <div
      id="project-detail-modal"
      className="project-modal-backdrop show"
      aria-hidden="false"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="project-modal-dialog">
        <button
          type="button"
          className="project-modal-close"
          aria-label="Close project details"
          id="modal-close-btn"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="project-modal-image-wrapper">
          <div
            id="modal-project-backdrop"
            className="project-modal-backdrop-bg"
            style={{ backgroundImage: `url('${imgSrc}')` }}
          ></div>
          <img
            id="modal-project-img"
            src={imgSrc}
            alt={`${project.title} preview`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/images/portfolio-1.png';
            }}
          />
          <span id="modal-project-category" className="project-category-badge">
            <i className="fa-solid fa-layer-group"></i> {project.category || 'Project'}
          </span>
        </div>

        <div className="project-modal-content">
          <div className="project-modal-header">
            <h3 id="modal-project-title">{project.title}</h3>
            <div id="modal-project-status">
              {isComingSoon ? (
                <span className="badge-coming-soon">
                  <i className="fa-solid fa-clock"></i> Coming Soon
                </span>
              ) : (
                <span className="badge-live-project">
                  <i className="fa-solid fa-circle-check"></i> Live Project
                </span>
              )}
            </div>
          </div>

          <div
            id="modal-project-desc"
            className="project-modal-desc"
            dangerouslySetInnerHTML={{
              __html: formatRichDescription(project.description || '')
            }}
          />

          {techList.length > 0 && (
            <div className="project-modal-tech">
              <h4>
                <i className="fa-solid fa-microchip"></i> Technologies Used
              </h4>
              <div id="modal-project-tech-list" className="tech-badge-container">
                {techList.map((tech) => (
                  <span className="tech-pill" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="project-modal-actions" id="modal-project-actions">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-color-2 btn-sm"
              >
                <i className="fa-brands fa-github"></i> GitHub Repository
              </a>
            )}
            {!project.isComingSoon && project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-color-1 btn-sm"
              >
                <i
                  className={
                    isPlayStore
                      ? 'fa-brands fa-google-play'
                      : 'fa-solid fa-arrow-up-right-from-square'
                  }
                ></i>{' '}
                {project.demoLabel || 'Live Demo'}
              </a>
            )}
            <button
              type="button"
              className="btn btn-color-2 btn-sm project-modal-footer-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalNode, document.body);
  }

  return modalNode;
}
