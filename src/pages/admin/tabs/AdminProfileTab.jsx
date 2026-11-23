import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import {
  IconBolt,
  IconCamera,
  IconCircleCheck,
  IconDeviceFloppy,
  IconFileTypePdf,
  IconIdBadge2,
  IconLoader2,
  IconRotate,
  IconUserCircle
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { FALLBACK_SITE_SETTINGS } from '../../../data/fallbackData';
import { compressImageToBase64 } from '../../../utils/imageCompressor';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Textarea } from '../../../components/ui/textarea';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminFormShimmer } from '../AdminShimmer';

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const heroInputRef = useRef(null);
  const aboutInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      if (!db) {
        setLoading(false);
        return;
      }
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
      } finally {
        setLoading(false);
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
    e.target.value = '';
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
    <section id="tab-profile" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Profile, Bio & Resume Settings"
        description="Update hero headline, typewriter roles, about biography, portraits, and CV file."
      />

      <Card className="py-6">
        <CardContent className="px-5 sm:px-6">
          {loading ? (
            <AdminFormShimmer fields={6} />
          ) : (
            <form id="profile-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* IDENTITY & BIO */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-name">Full Display Name</Label>
                    <Input
                      type="text"
                      id="profile-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-greeting">Hero Greeting</Label>
                    <Input
                      type="text"
                      id="profile-greeting"
                      value={formData.heroGreeting}
                      onChange={(e) => setFormData({ ...formData, heroGreeting: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-roles">
                    Typewriter Animated Roles (Comma-separated)
                  </Label>
                  <Input
                    type="text"
                    id="profile-roles"
                    placeholder="Web Developer, Mobile Developer, Tech Enthusiast"
                    value={formData.typewriterRoles}
                    onChange={(e) => setFormData({ ...formData, typewriterRoles: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-bio">About Me Biography Paragraph</Label>
                  <Textarea
                    id="profile-bio"
                    rows={4}
                    required
                    value={formData.bioText}
                    onChange={(e) => setFormData({ ...formData, bioText: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-exp-years">Experience Badge Title</Label>
                    <Input
                      type="text"
                      id="profile-exp-years"
                      placeholder="1+ years"
                      value={formData.expYears}
                      onChange={(e) => setFormData({ ...formData, expYears: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-exp-sub">Experience Subtitle</Label>
                    <Input
                      type="text"
                      id="profile-exp-sub"
                      placeholder="Web & Mobile Development"
                      value={formData.expSub}
                      onChange={(e) => setFormData({ ...formData, expSub: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-edu-degree">Education Degree</Label>
                    <Input
                      type="text"
                      id="profile-edu-degree"
                      placeholder="B.Sc. Bachelors Degree"
                      value={formData.eduDegree}
                      onChange={(e) => setFormData({ ...formData, eduDegree: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-edu-major">Education Major / Field</Label>
                    <Input
                      type="text"
                      id="profile-edu-major"
                      placeholder="Information Technology"
                      value={formData.eduMajor}
                      onChange={(e) => setFormData({ ...formData, eduMajor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* PROFILE PHOTOS */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                    <IconCamera className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                    Profile &amp; About Photos (Zero-Cost Auto-Compressed)
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Upload custom portrait photos for the Hero section and About section. Images are automatically resized and compressed to WebP/JPEG Base64 (~35 KB) inside your browser.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Hero Portrait */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm leading-none font-medium">Hero Section Portrait Photo</p>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => heroInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          heroInputRef.current?.click();
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handlePhotoSelect(e.dataTransfer.files[0], 'hero');
                        }
                      }}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/25 p-5 text-center transition-colors hover:border-foreground/50 hover:bg-muted/40"
                    >
                      <input
                        ref={heroInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoSelect(e.target.files[0], 'hero');
                          }
                          e.target.value = '';
                        }}
                      />
                      <IconUserCircle className="size-6 text-muted-foreground" stroke={1.5} aria-hidden="true" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          Click or Drop Hero Photo Here
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Fallback: <code className="font-mono">/assets/images/arko-pic.jpg</code>
                        </span>
                      </div>
                      <img
                        src={
                          heroImage && !heroImageRemoved
                            ? heroImage
                            : '/assets/images/arko-pic.jpg'
                        }
                        alt="Hero Preview"
                        className="size-28 rounded-full border border-border object-cover"
                      />
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        <IconBolt className="size-3" stroke={1.75} aria-hidden="true" />
                        {heroCompressedKB
                          ? `Compressed (${heroCompressedKB} KB)`
                          : heroImage && !heroImageRemoved
                            ? 'Stored in Firestore'
                            : 'Default Static Photo'}
                      </Badge>
                    </div>
                    {heroImage && !heroImageRemoved ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setHeroImage(null);
                            setHeroImageRemoved(true);
                            setHeroCompressedKB(null);
                            showToast(
                              'Hero photo will revert to default after you click Save Changes.',
                              'info'
                            );
                          }}
                        >
                          <IconRotate className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                          Reset Default Hero Photo
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* About Portrait */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm leading-none font-medium">About Me Section Photo</p>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => aboutInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          aboutInputRef.current?.click();
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handlePhotoSelect(e.dataTransfer.files[0], 'about');
                        }
                      }}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/25 p-5 text-center transition-colors hover:border-foreground/50 hover:bg-muted/40"
                    >
                      <input
                        ref={aboutInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoSelect(e.target.files[0], 'about');
                          }
                          e.target.value = '';
                        }}
                      />
                      <IconIdBadge2 className="size-6 text-muted-foreground" stroke={1.5} aria-hidden="true" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          Click or Drop About Photo Here
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Fallback: <code className="font-mono">/assets/images/arko-about.jpg</code>
                        </span>
                      </div>
                      <img
                        src={
                          aboutImage && !aboutImageRemoved
                            ? aboutImage
                            : '/assets/images/arko-about.jpg'
                        }
                        alt="About Preview"
                        className="size-28 rounded-2xl border border-border object-cover"
                      />
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        <IconBolt className="size-3" stroke={1.75} aria-hidden="true" />
                        {aboutCompressedKB
                          ? `Compressed (${aboutCompressedKB} KB)`
                          : aboutImage && !aboutImageRemoved
                            ? 'Stored in Firestore'
                            : 'Default Static Photo'}
                      </Badge>
                    </div>
                    {aboutImage && !aboutImageRemoved ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setAboutImage(null);
                            setAboutImageRemoved(true);
                            setAboutCompressedKB(null);
                            showToast(
                              'About photo will revert to default after you click Save Changes.',
                              'info'
                            );
                          }}
                        >
                          <IconRotate className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                          Reset Default About Photo
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <Separator />

              {/* CV RESUME */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                  <IconFileTypePdf className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                  Curriculum Vitae (CV) Resume
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-cv-url">CV File Path or Google Drive Link</Label>
                    <Input
                      type="text"
                      id="profile-cv-url"
                      placeholder="/assets/docs/cv-vinsensiusarka.pdf"
                      value={formData.cvUrl}
                      onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default static file: <code className="font-mono">/assets/docs/cv-vinsensiusarka.pdf</code>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-cv-upload">
                      Or Upload New PDF (Under 700KB for Firestore Direct Storage)
                    </Label>
                    <Input
                      type="file"
                      id="profile-cv-upload"
                      accept="application/pdf"
                      onChange={handleCvFileChange}
                    />
                    {cvStatusText ? (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                        <IconCircleCheck className="size-3.5 shrink-0" stroke={1.75} aria-hidden="true" />
                        <span>{cvStatusText}</span>
                      </p>
                    ) : null}
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
                      Save Profile &amp; Bio Changes
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
