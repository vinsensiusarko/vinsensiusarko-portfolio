import { useEffect } from 'react';
import { formatRichDescription } from '../../utils/formatDescription';

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

  const imgSrc = project.image || '/assets/images/portfolio-1.png';
  const isComingSoon = Boolean(project.isComingSoon) || (!project.demoUrl && !project.githubUrl);
  const techList = Array.isArray(project.techStack) ? project.techStack : [];
  const isPlayStore =
    project.demoLabel === 'Play Store' ||
    String(project.demoUrl || '').includes('play.google.com');

  return (
    <div
      id="project-detail-modal"
      className="project-modal-backdrop show"
      aria-hidden="false"
      role="dialog"
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
          <img id="modal-project-img" src={imgSrc} alt={`${project.title} preview`} />
          <span id="modal-project-category" className="project-category-badge">
            {project.category || 'Project'}
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
                <span
                  className="badge-coming-soon"
                  style={{ color: '#10b981', borderColor: '#10b981' }}
                >
                  <i className="fa-solid fa-check"></i> Live Project
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

          <div className="project-modal-tech">
            <h4>Technologies Used</h4>
            <div id="modal-project-tech-list" className="tech-badge-container">
              {techList.map((tech) => (
                <span className="tech-pill" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
