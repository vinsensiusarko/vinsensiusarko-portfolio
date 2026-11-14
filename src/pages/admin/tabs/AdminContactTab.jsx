import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FALLBACK_CONTACT_SETTINGS } from '../../../data/fallbackData';

export function AdminContactTab({ showToast }) {
  const [formData, setFormData] = useState({
    email: FALLBACK_CONTACT_SETTINGS.email,
    whatsapp: FALLBACK_CONTACT_SETTINGS.whatsapp,
    linkedin: FALLBACK_CONTACT_SETTINGS.linkedin,
    github: FALLBACK_CONTACT_SETTINGS.github,
    instagram: FALLBACK_CONTACT_SETTINGS.instagram,
    facebook: FALLBACK_CONTACT_SETTINGS.facebook,
    twitter: FALLBACK_CONTACT_SETTINGS.twitter
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContact() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'settings', 'contact_settings'));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            email: data.email || FALLBACK_CONTACT_SETTINGS.email,
            whatsapp: data.whatsapp || FALLBACK_CONTACT_SETTINGS.whatsapp,
            linkedin: data.linkedin || FALLBACK_CONTACT_SETTINGS.linkedin,
            github: data.github || FALLBACK_CONTACT_SETTINGS.github,
            instagram: data.instagram || FALLBACK_CONTACT_SETTINGS.instagram,
            facebook: data.facebook || FALLBACK_CONTACT_SETTINGS.facebook,
            twitter: data.twitter || FALLBACK_CONTACT_SETTINGS.twitter
          });
        }
      } catch (err) {
        console.error('Error loading contact settings:', err);
      }
    }
    loadContact();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);

    try {
      await setDoc(
        doc(db, 'settings', 'contact_settings'),
        {
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          linkedin: formData.linkedin.trim(),
          github: formData.github.trim(),
          instagram: formData.instagram.trim(),
          facebook: formData.facebook.trim(),
          twitter: formData.twitter.trim(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      showToast('Contact & Social links updated!', 'success');
    } catch (err) {
      console.error('Error saving contact:', err);
      showToast('Failed to save contact settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="tab-contact" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Contact &amp; Social Media Links</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Update your public email, WhatsApp floating button, and social links.
            </p>
          </div>
        </div>

        <form id="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">
                <i className="fa-solid fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="contact-email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-whatsapp">
                <i className="fa-brands fa-whatsapp"></i> WhatsApp Link (wa.me)
              </label>
              <input
                type="url"
                id="contact-whatsapp"
                className="form-input"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-linkedin">
                <i className="fa-brands fa-linkedin"></i> LinkedIn URL
              </label>
              <input
                type="url"
                id="contact-linkedin"
                className="form-input"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-github">
                <i className="fa-brands fa-github"></i> GitHub URL
              </label>
              <input
                type="url"
                id="contact-github"
                className="form-input"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-instagram">
                <i className="fa-brands fa-instagram"></i> Instagram URL
              </label>
              <input
                type="url"
                id="contact-instagram"
                className="form-input"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-facebook">
                <i className="fa-brands fa-facebook"></i> Facebook URL
              </label>
              <input
                type="url"
                id="contact-facebook"
                className="form-input"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-twitter">
              <i className="fa-brands fa-x-twitter"></i> X / Twitter URL
            </label>
            <input
              type="url"
              id="contact-twitter"
              className="form-input"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Save Contact Channels
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
