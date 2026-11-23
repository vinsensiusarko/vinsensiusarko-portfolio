import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  IconCalendarCheck,
  IconDeviceFloppy,
  IconExternalLink,
  IconFileText,
  IconHeading,
  IconLoader2,
  IconRotate,
  IconStar
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { FALLBACK_PRIVACY_POLICY } from '../../../data/fallbackData';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Textarea } from '../../../components/ui/textarea';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminFormShimmer } from '../AdminShimmer';

export function AdminPrivacyTab({ showToast }) {
  const confirm = useConfirm();
  const [formData, setFormData] = useState({ ...FALLBACK_PRIVACY_POLICY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPrivacy() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'settings', 'privacy_policy'));
        if (snap.exists()) {
          setFormData({ ...FALLBACK_PRIVACY_POLICY, ...snap.data() });
        }
      } catch (err) {
        console.error('Error loading privacy policy settings:', err);
      } finally {
        setLoading(false);
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

  const handleResetDefaults = async () => {
    const ok = await confirm({
      title: 'Reset Template Privacy Policy?',
      message:
        'Reset semua input Privacy Policy ke template bawaan? Klik "Save Privacy Policy Changes" setelahnya untuk menyimpan perubahan.',
      confirmText: 'Reset Defaults',
      cancelText: 'Batal',
      variant: 'warning'
    });
    if (!ok) return;

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
    <section id="tab-privacy" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Privacy Policy Page Management"
        description="Customize the public Privacy Policy page (/privacy-policy) used for Google Play Store, Apple App Store, and web compliance."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/privacy-policy" target="_blank">
                <IconExternalLink className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                Preview Page
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleResetDefaults}>
              <IconRotate className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Reset Defaults
            </Button>
          </>
        }
      />

      <Card className="py-6">
        <CardContent className="px-5 sm:px-6">
          {loading ? (
            <AdminFormShimmer fields={6} />
          ) : (
            <form id="privacy-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* HEADER & METADATA */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                  <IconHeading className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                  Page Header &amp; Metadata
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-title">Page Title</Label>
                    <Input
                      type="text"
                      id="privacy-title"
                      required
                      value={formData.title}
                      onChange={updateField('title')}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-last-updated">Last Updated Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        id="privacy-last-updated"
                        required
                        value={formData.lastUpdated}
                        onChange={updateField('lastUpdated')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0"
                        onClick={handleSetToday}
                      >
                        <IconCalendarCheck
                          className="size-4"
                          stroke={1.75}
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        Today
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-badge">Compliance Badge Label</Label>
                    <Input
                      type="text"
                      id="privacy-badge"
                      value={formData.complianceBadge}
                      onChange={updateField('complianceBadge')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-developer">Developer / Entity Name</Label>
                    <Input
                      type="text"
                      id="privacy-developer"
                      required
                      value={formData.developerName}
                      onChange={updateField('developerName')}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-subtitle">Header Subtitle / Introduction</Label>
                  <Textarea
                    id="privacy-subtitle"
                    rows={2}
                    required
                    value={formData.subtitle}
                    onChange={updateField('subtitle')}
                  />
                </div>
              </div>

              <Separator />

              {/* HIGHLIGHT SUMMARY CARDS */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                    <IconStar className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                    Top Highlight Summary Cards (3 Pillars)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Quick visual cards shown at the top of the Privacy Policy page.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {[
                    { idx: 1, titleKey: 'highlight1Title', descKey: 'highlight1Desc' },
                    { idx: 2, titleKey: 'highlight2Title', descKey: 'highlight2Desc' },
                    { idx: 3, titleKey: 'highlight3Title', descKey: 'highlight3Desc' }
                  ].map(({ idx, titleKey, descKey }) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`privacy-hl${idx}-title`}>Card {idx} Title</Label>
                        <Input
                          type="text"
                          id={`privacy-hl${idx}-title`}
                          value={formData[titleKey]}
                          onChange={updateField(titleKey)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`privacy-hl${idx}-desc`}>Card {idx} Description</Label>
                        <Textarea
                          id={`privacy-hl${idx}-desc`}
                          rows={2}
                          value={formData[descKey]}
                          onChange={updateField(descKey)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* POLICY CONTENT SECTIONS */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                    <IconFileText className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                    Policy Content Sections
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Supports paragraphs and bullet lists (start a line with <code className="font-mono">- </code> to create a bullet item).
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-scope">1. Scope &amp; Overview</Label>
                  <Textarea
                    id="privacy-sec-scope"
                    rows={3}
                    value={formData.sectionScope}
                    onChange={updateField('sectionScope')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-data">2. Information Collection &amp; Use</Label>
                  <Textarea
                    id="privacy-sec-data"
                    rows={5}
                    value={formData.sectionDataCollection}
                    onChange={updateField('sectionDataCollection')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-permissions">3. Device Permissions</Label>
                  <Textarea
                    id="privacy-sec-permissions"
                    rows={4}
                    value={formData.sectionPermissions}
                    onChange={updateField('sectionPermissions')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-thirdparty">4. Third-Party Services &amp; SDKs</Label>
                  <Textarea
                    id="privacy-sec-thirdparty"
                    rows={4}
                    value={formData.sectionThirdParty}
                    onChange={updateField('sectionThirdParty')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-retention">
                    5. Data Retention, Deletion &amp; Children&apos;s Privacy
                  </Label>
                  <Textarea
                    id="privacy-sec-retention"
                    rows={3}
                    value={formData.sectionDataDeletion}
                    onChange={updateField('sectionDataDeletion')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="privacy-sec-contact">
                    6. Changes to Policy &amp; Contact Statement
                  </Label>
                  <Textarea
                    id="privacy-sec-contact"
                    rows={3}
                    value={formData.sectionContact}
                    onChange={updateField('sectionContact')}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-contact-email">Privacy Contact Email</Label>
                    <Input
                      type="email"
                      id="privacy-contact-email"
                      value={formData.contactEmail}
                      onChange={updateField('contactEmail')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="privacy-contact-website">
                      Official Portfolio / Developer Website URL
                    </Label>
                    <Input
                      type="url"
                      id="privacy-contact-website"
                      value={formData.contactWebsite}
                      onChange={updateField('contactWebsite')}
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
                      Save Privacy Policy Changes
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
