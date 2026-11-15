import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FALLBACK_SITE_SETTINGS } from '../../../data/fallbackData';
import { OG_THEMES, renderOgBanner } from '../../../utils/ogImageGenerator';

export function AdminSeoTab({ showToast }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState('twitter'); // 'twitter' | 'whatsapp' | 'linkedin'

  const [formData, setFormData] = useState({
    theme: 'cyber',
    title: FALLBACK_SITE_SETTINGS.name || 'Vinsensius Arka',
    role: 'Web & Mobile Developer',
    description:
      'Explore projects, skills, and professional portfolio of Vinsensius Arka specializing in Flutter, React, Laravel, and native Java.',
    website: 'vinsensiusarka.id',
    techStack: 'Flutter, React, Laravel, Node.js, Java, MySQL',
    includeAvatar: true
  });

  const [avatarImage, setAvatarImage] = useState(
    FALLBACK_SITE_SETTINGS.heroImage || '/assets/images/arko-pic.png'
  );

  // Load existing SEO settings from Firestore
  useEffect(() => {
    async function loadSeoSettings() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'settings', 'site_settings'));
        if (snap.exists()) {
          const data = snap.data();
          setFormData((prev) => ({
            ...prev,
            title: data.ogTitle || data.name || prev.title,
            role: data.ogRole || prev.role,
            description: data.ogDescription || data.bioText?.slice(0, 160) || prev.description,
            website: data.ogWebsite || prev.website,
            techStack: data.ogTechStack || prev.techStack,
            theme: data.ogTheme || prev.theme,
            includeAvatar:
              data.ogIncludeAvatar !== undefined ? data.ogIncludeAvatar : prev.includeAvatar
          }));
          if (data.heroImage) {
            setAvatarImage(data.heroImage);
          }
        }
      } catch (err) {
        console.error('Error loading SEO settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSeoSettings();
  }, []);

  // Re-draw canvas whenever form data changes
  const redrawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    await renderOgBanner(canvas, {
      theme: formData.theme,
      title: formData.title,
      role: formData.role,
      description: formData.description,
      website: formData.website,
      techStack: formData.techStack,
      avatarImage: formData.includeAvatar ? avatarImage : null
    });
  }, [formData, avatarImage]);

  useEffect(() => {
    if (!loading) {
      redrawCanvas();
    }
  }, [loading, redrawCanvas]);

  // Handle Download PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL ? canvas.toDataURL('image/png') : '';
      } catch {
        dataUrl = 'data:image/png;base64,mock';
      }
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `og-image-${formData.theme}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      showToast('OpenGraph 1200x630 PNG downloaded!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download image: ' + err.message, 'error');
    }
  };

  // Handle Copy to Clipboard
  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.toBlob) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Could not convert canvas to image blob.', 'error');
          return;
        }
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('Image copied to clipboard!', 'success');
        } else {
          showToast('Clipboard API not supported in this browser.', 'warning');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Failed to copy to clipboard: ' + err.message, 'error');
    }
  };

  // Handle Save to Firestore
  const handleSaveToFirestore = async () => {
    if (!db) {
      showToast('Firebase not initialized.', 'error');
      return;
    }
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      let ogDataUrl = '';
      try {
        ogDataUrl = canvas ? canvas.toDataURL('image/png') : '';
      } catch {
        ogDataUrl = '';
      }

      const payload = {
        ogTitle: formData.title.trim(),
        ogRole: formData.role.trim(),
        ogDescription: formData.description.trim(),
        ogWebsite: formData.website.trim(),
        ogTechStack: formData.techStack.trim(),
        ogTheme: formData.theme,
        ogIncludeAvatar: formData.includeAvatar,
        ogImage: ogDataUrl,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'settings', 'site_settings'), payload, { merge: true });
      showToast('OpenGraph image & SEO settings saved to website!', 'success');
    } catch (err) {
      console.error('Error saving OG settings:', err);
      showToast('Failed to save SEO settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="tab-seo" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <i className="fa-solid fa-share-nodes"></i> SEO &amp; OpenGraph Image Generator
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Generate high-definition (1200 &times; 630 px) social share cards for WhatsApp,
              Twitter/X, LinkedIn, Discord, and Telegram. Customize themes, badges, and save directly
              to your website metadata.
            </p>
          </div>
        </div>

        <div className="seo-generator-grid">
          {/* LEFT COLUMN: LIVE CANVAS PREVIEW */}
          <div className="seo-preview-pane">
            <div className="card" style={{ background: 'var(--bg-card-alt)', marginBottom: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Social Preview:
                  </span>
                  <div className="platform-toggle-group">
                    <button
                      type="button"
                      className={`platform-btn ${previewPlatform === 'twitter' ? 'active' : ''}`}
                      onClick={() => setPreviewPlatform('twitter')}
                      title="Preview as Twitter / X Large Summary Card"
                    >
                      <i className="fa-brands fa-x-twitter"></i> Twitter / X
                    </button>
                    <button
                      type="button"
                      className={`platform-btn ${previewPlatform === 'whatsapp' ? 'active' : ''}`}
                      onClick={() => setPreviewPlatform('whatsapp')}
                      title="Preview as WhatsApp Link Bubble"
                    >
                      <i className="fa-brands fa-whatsapp"></i> WhatsApp
                    </button>
                    <button
                      type="button"
                      className={`platform-btn ${previewPlatform === 'linkedin' ? 'active' : ''}`}
                      onClick={() => setPreviewPlatform('linkedin')}
                      title="Preview as LinkedIn Post Card"
                    >
                      <i className="fa-brands fa-linkedin"></i> LinkedIn
                    </button>
                  </div>
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  1200 &times; 630 (1.91 : 1)
                </span>
              </div>

              {/* PLATFORM FRAME CONTAINER */}
              <div className={`platform-frame platform-frame-${previewPlatform}`}>
                {/* CANVAS */}
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    id="og-canvas-preview"
                    className="og-canvas"
                    aria-label="OpenGraph Social Card Preview"
                  />
                </div>

                {/* SOCIAL PLATFORM METADATA FOOTER */}
                {previewPlatform === 'twitter' && (
                  <div className="social-meta-box">
                    <span className="social-domain">{formData.website}</span>
                    <h4 className="social-title">{formData.title} — {formData.role}</h4>
                    <p className="social-desc">{formData.description}</p>
                  </div>
                )}

                {previewPlatform === 'whatsapp' && (
                  <div className="social-meta-box whatsapp-box">
                    <h4 className="social-title">{formData.title}</h4>
                    <p className="social-desc">{formData.description}</p>
                    <span className="social-domain">{formData.website}</span>
                  </div>
                )}

                {previewPlatform === 'linkedin' && (
                  <div className="social-meta-box linkedin-box">
                    <h4 className="social-title">{formData.title} — {formData.role}</h4>
                    <span className="social-domain">{formData.website} • 1 min read</span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  marginTop: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  id="btn-download-og"
                  className="btn btn-primary"
                  onClick={handleDownload}
                >
                  <i className="fa-solid fa-download"></i> Download 1200&times;630 PNG
                </button>
                <button
                  type="button"
                  id="btn-copy-og"
                  className="btn btn-secondary"
                  onClick={handleCopyClipboard}
                >
                  <i className="fa-regular fa-copy"></i> Copy Image
                </button>
                <button
                  type="button"
                  id="btn-save-og"
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={handleSaveToFirestore}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>{' '}
                  {saving ? 'Saving...' : 'Save as Website SEO'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS & CUSTOMIZATION */}
          <div className="seo-controls-pane">
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
                <i className="fa-solid fa-sliders"></i> Card Design &amp; Content
              </h3>

              {/* THEME PICKER */}
              <div className="form-group">
                <label className="form-label">Banner Color Theme</label>
                <div className="og-theme-grid">
                  {Object.values(OG_THEMES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`theme-chip-btn ${formData.theme === t.id ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, theme: t.id })}
                    >
                      <span
                        className="theme-chip-dot"
                        style={{
                          background: `linear-gradient(135deg, ${t.bg1}, ${t.accent})`
                        }}
                      ></span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD TITLE */}
              <div className="form-group">
                <label className="form-label" htmlFor="og-input-title">
                  Headline / Author Name
                </label>
                <input
                  type="text"
                  id="og-input-title"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Vinsensius Arka"
                />
              </div>

              {/* ROLE / SUBTITLE */}
              <div className="form-group">
                <label className="form-label" htmlFor="og-input-role">
                  Professional Role / Subtitle
                </label>
                <input
                  type="text"
                  id="og-input-role"
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Web & Mobile Developer"
                />
              </div>

              {/* DESCRIPTION / BIO */}
              <div className="form-group">
                <label className="form-label" htmlFor="og-input-desc">
                  Bio / Tagline (Social Description)
                </label>
                <textarea
                  id="og-input-desc"
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short engaging pitch for social media links"
                />
              </div>

              {/* TECH STACK BADGES */}
              <div className="form-group">
                <label className="form-label" htmlFor="og-input-tech">
                  Key Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  id="og-input-tech"
                  className="form-input"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. Flutter, React, Laravel, Node.js, Java"
                />
              </div>

              {/* WEBSITE URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="og-input-website">
                  Website URL Display
                </label>
                <input
                  type="text"
                  id="og-input-website"
                  className="form-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g. vinsensiusarka.id"
                />
              </div>

              {/* AVATAR TOGGLE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-check-label" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="og-toggle-avatar"
                    checked={formData.includeAvatar}
                    onChange={(e) => setFormData({ ...formData, includeAvatar: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    Include Profile Photo Avatar on Banner
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
