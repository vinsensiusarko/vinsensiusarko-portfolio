import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconDeviceFloppy,
  IconLoader2,
  IconMail
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { FALLBACK_CONTACT_SETTINGS } from '../../../data/fallbackData';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminFormShimmer } from '../AdminShimmer';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContact() {
      if (!db) {
        setLoading(false);
        return;
      }
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
      } finally {
        setLoading(false);
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
    <section id="tab-contact" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Contact & Social Media Links"
        description="Update your public email, WhatsApp floating button, and social profile URLs."
      />

      <Card className="py-6">
        <CardContent className="px-5 sm:px-6">
          {loading ? (
            <AdminFormShimmer fields={4} />
          ) : (
            <form id="contact-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Direct Channels
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">
                      <IconMail className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      id="contact-email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-whatsapp">
                      <IconBrandWhatsapp className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      WhatsApp Link (wa.me)
                    </Label>
                    <Input
                      type="url"
                      id="contact-whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Social Profiles
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-linkedin">
                      <IconBrandLinkedin className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      LinkedIn URL
                    </Label>
                    <Input
                      type="url"
                      id="contact-linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-github">
                      <IconBrandGithub className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      GitHub URL
                    </Label>
                    <Input
                      type="url"
                      id="contact-github"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-instagram">
                      <IconBrandInstagram className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      Instagram URL
                    </Label>
                    <Input
                      type="url"
                      id="contact-instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-facebook">
                      <IconBrandFacebook className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      Facebook URL
                    </Label>
                    <Input
                      type="url"
                      id="contact-facebook"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="contact-twitter">
                      <IconBrandX className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                      X / Twitter URL
                    </Label>
                    <Input
                      type="url"
                      id="contact-twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-start border-t border-border pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <IconLoader2
                        className="size-4 animate-spin"
                        stroke={1.75}
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy
                        className="size-4"
                        stroke={1.75}
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      Save Contact Channels
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
