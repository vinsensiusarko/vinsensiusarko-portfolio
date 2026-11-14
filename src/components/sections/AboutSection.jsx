export function AboutSection({ siteSettings }) {
  return (
    <section id="about" className="reveal-on-scroll">
      <p className="section__text__p1">Get To Know More</p>
      <h2 className="title">About Me</h2>
      <div className="section-container">
        <div className="section__pic-container about-pic-wrapper">
          <img
            id="about-img"
            src={siteSettings.aboutImage || '/assets/images/arko-about.jpg'}
            alt={`${siteSettings.name || 'Vinsensius Arka'} personal photo`}
            width="380"
            height="380"
            style={{ borderRadius: 'var(--radius-card)', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div className="about-details-container">
          <div className="about-containers">
            <div className="details-container">
              <i className="fa-solid fa-briefcase about-card-icon"></i>
              <h3>Experience</h3>
              <p>
                {siteSettings.expYears || '3+ years'} <br />
                {siteSettings.expSub || 'Web & Mobile Development'}
              </p>
            </div>
            <div className="details-container">
              <i className="fa-solid fa-graduation-cap about-card-icon"></i>
              <h3>Education</h3>
              <p>
                {siteSettings.eduDegree || 'Bachelors Degree'} <br />
                {siteSettings.eduMajor || 'Computer Science'}
              </p>
            </div>
          </div>
          <div className="text-container">
            <p>{siteSettings.bioText}</p>
          </div>
        </div>
      </div>
      <div className="arrow">
        <a href="#experience" aria-label="Scroll down to Experience section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>
    </section>
  );
}
