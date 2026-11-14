import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FALLBACK_PRIVACY_POLICY } from '../../../data/fallbackData';

export function AdminPrivacyTab({ showToast }) {
  const [formData, setFormData] = useState({ ...FALLBACK_PRIVACY_POLICY });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPrivacy() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'settings', 'privacy_policy'));
        if (snap.exists()) {
          setFormData({ ...FALLBACK_PRIVACY_POLICY, ...snap.data() });
        }
      } catch (err) {
        console.error('Error loading privacy policy settings:', err);
      }
    }
    loadPrivacy();
  }, []);

  const handleSetToday = () => {
    const formatted = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setFormData((prev) => ({ ...prev, lastUpdated: formatted }));
    showToast(`Date set to "${formatted}". Don't forget to Save!`, 'info');
  };

  const handleResetDefaults = () => {
    if (
      !window.confirm(
        'Reset all Privacy Policy fields to the default template? Click "Save Privacy Policy Changes" afterwards to apply.'
      )
    ) {
      return;
    }
    setFormData({ ...FALLBACK_PRIVACY_POLICY });
    showToast('Default template restored in form. Click Save Changes to persist.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);

    try {
      await setDoc(
        doc(db, 'settings', 'privacy_policy'),
        {
          ...formData,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      showToast('Privacy Policy updated! Live on /privacy-policy', 'success');
    } catch (err) {
      console.error('Error saving privacy policy:', err);
      showToast('Failed to save Privacy Policy: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <section id="tab-privacy" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Privacy Policy Page Management</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Customize the public Privacy Policy page (<code>/privacy-policy</code>) used for
              Google Play Store, Apple App Store, and web compliance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/privacy-policy" target="_blank" className="btn btn-secondary btn-sm">
              <i className="fa-solid fa-arrow-up-right-from-square"></i> Preview Page
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetDefaults}
            >
              <i className="fa-solid fa-rotate-left"></i> Reset Defaults
            </button>
          </div>
        </div>

        <form id="privacy-form" onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
            <i className="fa-solid fa-heading"></i> Page Header &amp; Metadata
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="privacy-title">
                Page Title
              </label>
              <input
                type="text"
                id="privacy-title"
                className="form-input"
                required
                value={formData.title}
                onChange={updateField('title')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="privacy-last-updated">
                Last Updated Date
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  id="privacy-last-updated"
                  className="form-input"
                  required
                  value={formData.lastUpdated}
                  onChange={updateField('lastUpdated')}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  onClick={handleSetToday}
                >
                  <i className="fa-solid fa-calendar-check"></i> Today
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="privacy-badge">
                Compliance Badge Label
              </label>
              <input
                type="text"
                id="privacy-badge"
                className="form-input"
                value={formData.complianceBadge}
                onChange={updateField('complianceBadge')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="privacy-developer">
                Developer / Entity Name
              </label>
              <input
                type="text"
                id="privacy-developer"
                className="form-input"
                required
                value={formData.developerName}
                onChange={updateField('developerName')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="privacy-subtitle">
              Header Subtitle / Introduction
            </label>
            <textarea
              id="privacy-subtitle"
              className="form-textarea"
              rows="2"
              required
              value={formData.subtitle}
              onChange={updateField('subtitle')}
            ></textarea>
          </div>

          {/* Highlight Cards */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              margin: '1.5rem 0',
              paddingTop: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <i className="fa-solid fa-star"></i> Top Highlight Summary Cards (3 Pillars)
            </h3>
            <p
              style={{
                fontSize: '0.83rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              Quick visual badges shown at the top of the Privacy Policy page.
            </p>

            <div className="form-row">
              <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="privacy-hl1-title">
                    Card 1 Title
                  </label>
                  <input
                    type="text"
                    id="privacy-hl1-title"
                    className="form-input"
                    value={formData.highlight1Title}
                    onChange={updateField('highlight1Title')}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="privacy-hl1-desc">
                    Card 1 Description
                  </label>
                  <textarea
                    id="privacy-hl1-desc"
                    className="form-textarea"
                    rows="2"
                    value={formData.highlight1Desc}
                    onChange={updateField('highlight1Desc')}
                  ></textarea>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="privacy-hl2-title">
                    Card 2 Title
                  </label>
                  <input
                    type="text"
                    id="privacy-hl2-title"
                    className="form-input"
                    value={formData.highlight2Title}
                    onChange={updateField('highlight2Title')}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="privacy-hl2-desc">
                    Card 2 Description
                  </label>
                  <textarea
                    id="privacy-hl2-desc"
                    className="form-textarea"
                    rows="2"
                    value={formData.highlight2Desc}
                    onChange={updateField('highlight2Desc')}
                  ></textarea>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="privacy-hl3-title">
                    Card 3 Title
                  </label>
                  <input
                    type="text"
                    id="privacy-hl3-title"
                    className="form-input"
                    value={formData.highlight3Title}
                    onChange={updateField('highlight3Title')}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="privacy-hl3-desc">
                    Card 3 Description
                  </label>
                  <textarea
                    id="privacy-hl3-desc"
                    className="form-textarea"
                    rows="2"
                    value={formData.highlight3Desc}
                    onChange={updateField('highlight3Desc')}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Content Sections */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              margin: '1.5rem 0',
              paddingTop: '1.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <i className="fa-solid fa-file-lines"></i> Policy Content Sections
            </h3>
            <p
              style={{
                fontSize: '0.83rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              Supports paragraphs and bullet lists (start a line with <code>- </code> to create a
              bullet item).
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-scope">
                1. Scope &amp; Overview
              </label>
              <textarea
                id="privacy-sec-scope"
                className="form-textarea"
                rows="3"
                value={formData.sectionScope}
                onChange={updateField('sectionScope')}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-data">
                2. Information Collection &amp; Use
              </label>
              <textarea
                id="privacy-sec-data"
                className="form-textarea"
                rows="5"
                value={formData.sectionDataCollection}
                onChange={updateField('sectionDataCollection')}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-permissions">
                3. Device Permissions
              </label>
              <textarea
                id="privacy-sec-permissions"
                className="form-textarea"
                rows="4"
                value={formData.sectionPermissions}
                onChange={updateField('sectionPermissions')}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-thirdparty">
                4. Third-Party Services &amp; SDKs
              </label>
              <textarea
                id="privacy-sec-thirdparty"
                className="form-textarea"
                rows="4"
                value={formData.sectionThirdParty}
                onChange={updateField('sectionThirdParty')}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-retention">
                5. Data Retention, Deletion &amp; Children&apos;s Privacy
              </label>
              <textarea
                id="privacy-sec-retention"
                className="form-textarea"
                rows="3"
                value={formData.sectionDataDeletion}
                onChange={updateField('sectionDataDeletion')}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="privacy-sec-contact">
                6. Changes to Policy &amp; Contact Statement
              </label>
              <textarea
                id="privacy-sec-contact"
                className="form-textarea"
                rows="3"
                value={formData.sectionContact}
                onChange={updateField('sectionContact')}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="privacy-contact-email">
                  Privacy Contact Email
                </label>
                <input
                  type="email"
                  id="privacy-contact-email"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={updateField('contactEmail')}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="privacy-contact-website">
                  Official Portfolio / Developer Website URL
                </label>
                <input
                  type="url"
                  id="privacy-contact-website"
                  className="form-input"
                  value={formData.contactWebsite}
                  onChange={updateField('contactWebsite')}
                />
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
                <i className="fa-solid fa-floppy-disk"></i> Save Privacy Policy Changes
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
