function SkillIcon({ skill }) {
  if (
    String(skill.name || '').toLowerCase() === 'flutter' ||
    skill.iconType === 'svg'
  ) {
    return (
      <svg
        className="skill-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    );
  }
  return <i className={`${skill.iconClass || 'fa-solid fa-code'} skill-icon`}></i>;
}

export function ExperienceSection({ skills }) {
  const languages = skills.filter((s) => s.category === 'language');
  const tools = skills.filter((s) => s.category === 'framework_tool');

  const renderSkillCard = (skill) => {
    const level = skill.level || 'Experienced';
    const isExperienced = level.toLowerCase() === 'experienced';

    return (
      <div className="skill-item" key={skill.id || skill.name}>
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
