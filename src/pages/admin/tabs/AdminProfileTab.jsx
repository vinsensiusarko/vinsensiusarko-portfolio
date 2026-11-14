import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FALLBACK_SITE_SETTINGS } from '../../../data/fallbackData';
import { compressImageToBase64 } from '../../../utils/imageCompressor';

export function AdminProfileTab({ showToast }) {
  const [formData, setFormData] = useState({
    name: FALLBACK_SITE_SETTINGS.name,
    heroGreeting: FALLBACK_SITE_SETTINGS.heroGreeting,
    typewriterRoles: FALLBACK_SITE_SETTINGS.typewriterRoles.join(', '),
    bioText: FALLBACK_SITE_SETTINGS.bioText,
    expYears: FALLBACK_SITE_SETTINGS.expYears,
    expSub: FALLBACK_SITE_SETTINGS.expSub,
    eduDegree: FALLBACK_SITE_SETTINGS.eduDegree,
    eduMajor: FALLBACK_SITE_SETTINGS.eduMajor,
    cvUrl: FALLBACK_SITE_SETTINGS.cvUrl
  });

  const [heroImage, setHeroImage] = useState(null);
  const [heroImageRemoved, setHeroImageRemoved] = useState(false);
  const [heroCompressedKB, setHeroCompressedKB] = useState(null);

  const [aboutImage, setAboutImage] = useState(null);
  const [aboutImageRemoved, setAboutImageRemoved] = useState(false);
  const [aboutCompressedKB, setAboutCompressedKB] = useState(null);

  const [cvBase64, setCvBase64] = useState(null);
  const [cvFileName, setCvFileName] = useState(null);
  const [cvStatusText, setCvStatusText] = useState('');

  const [saving, setSaving] = useState(false);

  const heroInputRef = useRef(null);
  const aboutInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'settings', 'site_settings'));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || FALLBACK_SITE_SETTINGS.name,
            heroGreeting: data.heroGreeting || FALLBACK_SITE_SETTINGS.heroGreeting,
            typewriterRoles: Array.isArray(data.typewriterRoles)
              ? data.typewriterRoles.join(', ')
              : FALLBACK_SITE_SETTINGS.typewriterRoles.join(', '),
            bioText: data.bioText || FALLBACK_SITE_SETTINGS.bioText,
            expYears: data.expYears || FALLBACK_SITE_SETTINGS.expYears,
            expSub: data.expSub || FALLBACK_SITE_SETTINGS.expSub,
            eduDegree: data.eduDegree || FALLBACK_SITE_SETTINGS.eduDegree,
            eduMajor: data.eduMajor || FALLBACK_SITE_SETTINGS.eduMajor,
            cvUrl: data.cvUrl || FALLBACK_SITE_SETTINGS.cvUrl
          });

          if (data.heroImage) {
            setHeroImage(data.heroImage);
            setHeroImageRemoved(false);
          }
          if (data.aboutImage) {
            setAboutImage(data.aboutImage);
            setAboutImageRemoved(false);
          }
          if (data.cvBase64) {
            const kb = ((data.cvBase64.length * 3) / 4 / 1024).toFixed(1);
            setCvStatusText(
              `Custom PDF stored in Firestore: ${data.cvFileName || 'CV.pdf'} (${kb} KB)`
            );
          }
        }
      } catch (err) {
        console.error('Error loading profile settings:', err);
      }
    }
    loadProfile();
  }, []);

  const handlePhotoSelect = async (file, targetType) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }
    try {
      showToast('Compressing photo via Canvas...', 'info');
      const { dataUrl, sizeKB } = await compressImageToBase64(file, 500, 0.78);
      if (targetType === 'hero') {
        setHeroImage(dataUrl);
        setHeroImageRemoved(false);
        setHeroCompressedKB(sizeKB);
        showToast(`Hero photo compressed to ${sizeKB} KB! Click Save Changes to apply.`, 'success');
      } else {
        setAboutImage(dataUrl);
        setAboutImageRemoved(false);
        setAboutCompressedKB(sizeKB);
        showToast(
          `About photo compressed to ${sizeKB} KB! Click Save Changes to apply.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error compressing photo:', err);
      showToast('Failed to compress image.', 'error');
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error');
      return;
    }
    if (file.size > 750 * 1024) {
      showToast('PDF exceeds 750KB limit for Firestore Base64. Use an external URL instead.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCvBase64(ev.target.result);
      setCvFileName(file.name);
      const kb = (file.size / 1024).toFixed(1);
      setCvStatusText(`Ready to save: ${file.name} (${kb} KB)`);
      showToast(`PDF "${file.name}" loaded (${kb} KB). Click Save Changes to store!`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      heroGreeting: formData.heroGreeting.trim(),
      typewriterRoles: formData.typewriterRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      bioText: formData.bioText.trim(),
      expYears: formData.expYears.trim(),
      expSub: formData.expSub.trim(),
      eduDegree: formData.eduDegree.trim(),
      eduMajor: formData.eduMajor.trim(),
      cvUrl: formData.cvUrl.trim(),
      updatedAt: serverTimestamp()
    };

    if (heroImageRemoved) {
      payload.heroImage = deleteField();
    } else if (heroImage) {
      payload.heroImage = heroImage;
    }

    if (aboutImageRemoved) {
      payload.aboutImage = deleteField();
    } else if (aboutImage) {
      payload.aboutImage = aboutImage;
    }

    if (cvBase64) {
      payload.cvBase64 = cvBase64;
      payload.cvFileName = cvFileName || 'CV-VinsensiusArka.pdf';
    }

    try {
      await setDoc(doc(db, 'settings', 'site_settings'), payload, { merge: true });
      showToast('Profile & Bio settings saved!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="tab-profile" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Profile, Bio &amp; Resume Settings</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Update hero headline, typewriter roles, about me bio, and CV file.
            </p>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Display Name
              </label>
              <input
                type="text"
                id="profile-name"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-greeting">
                Hero Greeting
              </label>
              <input
                type="text"
                id="profile-greeting"
                className="form-input"
                value={formData.heroGreeting}
                onChange={(e) => setFormData({ ...formData, heroGreeting: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-roles">
              Typewriter Animated Roles (Comma-separated)
            </label>
            <input
              type="text"
              id="profile-roles"
              className="form-input"
              placeholder="Web Developer, Mobile Developer, Tech Enthusiast"
              value={formData.typewriterRoles}
              onChange={(e) => setFormData({ ...formData, typewriterRoles: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">
              About Me Biography Paragraph
            </label>
            <textarea
              id="profile-bio"
              className="form-textarea"
              rows="4"
              required
              value={formData.bioText}
              onChange={(e) => setFormData({ ...formData, bioText: e.target.value })}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-exp-years">
                Experience Badge Title
              </label>
              <input
                type="text"
                id="profile-exp-years"
                className="form-input"
                placeholder="1+ years"
                value={formData.expYears}
                onChange={(e) => setFormData({ ...formData, expYears: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-exp-sub">
                Experience Subtitle
              </label>
              <input
                type="text"
                id="profile-exp-sub"
                className="form-input"
                placeholder="Web & Mobile Development"
                value={formData.expSub}
                onChange={(e) => setFormData({ ...formData, expSub: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-edu-degree">
                Education Degree
              </label>
              <input
                type="text"
                id="profile-edu-degree"
                className="form-input"
                placeholder="B.Sc. Bachelors Degree"
                value={formData.eduDegree}
                onChange={(e) => setFormData({ ...formData, eduDegree: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-edu-major">
                Education Major / Field
              </label>
              <input
                type="text"
                id="profile-edu-major"
                className="form-input"
                placeholder="Information Technology"
                value={formData.eduMajor}
                onChange={(e) => setFormData({ ...formData, eduMajor: e.target.value })}
              />
            </div>
          </div>

          {/* Profile Photos Section */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              margin: '1.5rem 0',
              paddingTop: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-camera-retro"></i> Profile &amp; About Photos (Zero-Cost
              Auto-Compressed)
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              Upload custom portrait photos for the Hero section and About section. Images are
              automatically resized and compressed to WebP/JPEG Base64 (~35KB) inside your browser.
            </p>

            <div className="form-row">
              {/* Hero Portrait Dropzone */}
              <div className="form-group">
                <label className="form-label">Hero Section Portrait Photo</label>
                <div
                  className="image-dropzone"
                  style={{ padding: '1.25rem' }}
                  onClick={() => heroInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handlePhotoSelect(e.dataTransfer.files[0], 'hero');
                    }
                  }}
                >
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoSelect(e.target.files[0], 'hero');
                      }
                    }}
                  />
                  <div
                    className="dropzone-icon"
                    style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}
                  >
                    <i className="fa-solid fa-user-circle"></i>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Click or Drop Hero Photo Here
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Default fallback: <code>/assets/images/arko-pic.png</code>
                  </p>

                  {heroImage && !heroImageRemoved && (
                    <div className="dropzone-preview">
                      <img
                        src={heroImage}
                        alt="Hero Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span className="compression-badge" style={{ marginTop: 0 }}>
                          <i className="fa-solid fa-bolt"></i>{' '}
                          {heroCompressedKB
                            ? `Compressed (${heroCompressedKB} KB)`
                            : 'Stored in Firestore'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroImage(null);
                            setHeroImageRemoved(true);
                            showToast(
                              'Hero photo will revert to default after you click Save Changes.',
                              'info'
                            );
                          }}
                        >
                          <i className="fa-solid fa-rotate-left"></i> Reset Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* About Portrait Dropzone */}
              <div className="form-group">
                <label className="form-label">About Me Section Photo</label>
                <div
                  className="image-dropzone"
                  style={{ padding: '1.25rem' }}
                  onClick={() => aboutInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handlePhotoSelect(e.dataTransfer.files[0], 'about');
                    }
                  }}
                >
                  <input
                    ref={aboutInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoSelect(e.target.files[0], 'about');
                      }
                    }}
                  />
                  <div
                    className="dropzone-icon"
                    style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}
                  >
                    <i className="fa-solid fa-id-badge"></i>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Click or Drop About Photo Here
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Default fallback: <code>/assets/images/about-pic.png</code>
                  </p>

                  {aboutImage && !aboutImageRemoved && (
                    <div className="dropzone-preview">
                      <img
                        src={aboutImage}
                        alt="About Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '1rem'
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span className="compression-badge" style={{ marginTop: 0 }}>
                          <i className="fa-solid fa-bolt"></i>{' '}
                          {aboutCompressedKB
                            ? `Compressed (${aboutCompressedKB} KB)`
                            : 'Stored in Firestore'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAboutImage(null);
                            setAboutImageRemoved(true);
                            showToast(
                              'About photo will revert to default after you click Save Changes.',
                              'info'
                            );
                          }}
                        >
                          <i className="fa-solid fa-rotate-left"></i> Reset Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CV Resume Section */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              margin: '1.5rem 0',
              paddingTop: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-file-pdf"></i> Curriculum Vitae (CV) Resume
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-cv-url">
                  CV File Path or Google Drive Link
                </label>
                <input
                  type="text"
                  id="profile-cv-url"
                  className="form-input"
                  placeholder="/assets/docs/cv-vinsensiusarka.pdf"
                  value={formData.cvUrl}
                  onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Default static file: <code>/assets/docs/cv-vinsensiusarka.pdf</code>
                </small>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-cv-upload">
                  Or Upload New PDF (Under 700KB for Firestore Direct Storage)
                </label>
                <input
                  type="file"
                  id="profile-cv-upload"
                  accept="application/pdf"
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                  onChange={handleCvFileChange}
                />
                {cvStatusText && (
                  <small
                    style={{
                      color: 'var(--accent-success)',
                      fontSize: '0.78rem',
                      display: 'block',
                      marginTop: '0.25rem'
                    }}
                  >
                    <i className="fa-solid fa-check-circle"></i> {cvStatusText}
                  </small>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Save Profile &amp; Bio Changes
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
