import { useMemo } from 'react';
import { SkillIcon } from '../common/SkillIcon';

export function ExperienceSection({ skills }) {
  const languages = useMemo(
    () => (skills || []).filter((s) => s.category === 'language'),
    [skills]
  );
  const tools = useMemo(
    () => (skills || []).filter((s) => s.category === 'framework_tool'),
    [skills]
  );

  const renderSkillCard = (skill) => {
    const level = skill.level || 'Experienced';
    const isExperienced = level.toLowerCase() === 'experienced';
    const itemKey = (skill.name || skill.id || '').toLowerCase().trim();

    return (
      <div className="skill-item" key={itemKey}>
        <div className="skill-icon-box">
          <SkillIcon skill={skill} />
        </div>
        <div className="skill-info">
          <h3>{skill.name}</h3>
          <span
            className={`skill-level-badge ${
              isExperienced ? 'experienced' : 'intermediate'
            }`}
          >
            {level}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className="reveal-on-scroll">
      <p className="section__text__p1">Explore My</p>
      <h2 className="title">Experience &amp; Skills</h2>
      <div className="experience-details-container">
        <div className="experience-box">
          <h3 className="experience-sub-title">
            <i className="fa-solid fa-code"></i> Programming Languages
          </h3>
          <div className="article-container">
            {languages.map(renderSkillCard)}
          </div>
        </div>

        <div className="experience-box">
          <h3 className="experience-sub-title">
            <i className="fa-solid fa-cubes"></i> Frameworks &amp; Tools
          </h3>
          <div className="article-container">
            {tools.map(renderSkillCard)}
          </div>
        </div>
      </div>
      <div className="arrow">
        <a href="#projects" aria-label="Scroll down to Projects section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>
    </section>
  );
}
