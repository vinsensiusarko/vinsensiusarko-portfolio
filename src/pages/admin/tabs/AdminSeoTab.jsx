import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  IconAdjustments,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconCloudUpload,
  IconCopy,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { FALLBACK_SITE_SETTINGS } from '../../../data/fallbackData';
import { OG_THEMES, renderOgBanner } from '../../../utils/ogImageGenerator';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { AdminPageHeader } from '../components/AdminPageHeader';

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter / X', title: 'Preview as Twitter / X Large Summary Card', Icon: IconBrandX },
  { id: 'whatsapp', label: 'WhatsApp', title: 'Preview as WhatsApp Link Bubble', Icon: IconBrandWhatsapp },
  { id: 'linkedin', label: 'LinkedIn', title: 'Preview as LinkedIn Post Card', Icon: IconBrandLinkedin }
];

export function AdminSeoTab({ showToast }) {
  const canvasRef = useRef(null);
  const drawSeqRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState('twitter');

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
    FALLBACK_SITE_SETTINGS.heroImage || '/assets/images/arko-pic.jpg'
  );

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

  const redrawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const seq = ++drawSeqRef.current;

    await renderOgBanner(canvas, {
      theme: formData.theme,
      title: formData.title,
      role: formData.role,
      description: formData.description,
      website: formData.website,
      techStack: formData.techStack,
      avatarImage: formData.includeAvatar ? avatarImage : null
    });

    if (seq !== drawSeqRef.current) return;
  }, [formData, avatarImage]);

  useEffect(() => {
    if (!loading) {
      redrawCanvas();
    }
  }, [loading, redrawCanvas]);

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

  const handleCopyClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.toBlob) return;

    canvas.toBlob(async (blob) => {
      try {
        if (!blob) {
          showToast('Could not convert canvas to image blob.', 'error');
          return;
        }
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Image copied to clipboard!', 'success');
        } else {
          showToast('Clipboard API not supported in this browser.', 'warning');
        }
      } catch (err) {
        console.error('Clipboard copy error:', err);
        showToast('Failed to copy to clipboard: ' + err.message, 'error');
      }
    }, 'image/png');
  };

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
        updatedAt: serverTimestamp()
      };
      if (ogDataUrl) {
        payload.ogImage = ogDataUrl;
      }

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
    <section id="tab-seo" className="flex flex-col gap-6">
      <AdminPageHeader
        title="SEO & OpenGraph Image Generator"
        badge="1200 × 630 px"
        description="Generate high-definition social share cards for WhatsApp, Twitter/X, LinkedIn, Discord, and Telegram. Customize themes and save directly to your website metadata."
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* LEFT: LIVE CANVAS & SOCIAL PREVIEW */}
        <Card className="gap-4 py-5 xl:sticky xl:top-20 xl:col-span-7">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-5 pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Social Preview:
              </span>
              <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {PLATFORMS.map(({ id, label, title, Icon }) => {
                  const isActive = previewPlatform === id;
                  return (
                    <Button
                      key={id}
                      type="button"
                      size="sm"
                      aria-pressed={isActive}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`h-11 px-3 text-xs sm:h-8 sm:px-2.5 ${isActive ? 'active' : ''}`}
                      onClick={() => setPreviewPlatform(id)}
                      title={title}
                    >
                      <Icon className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] tabular-nums">
              1.91 : 1
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 px-5">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="w-full overflow-hidden bg-muted">
                <canvas
                  ref={canvasRef}
                  id="og-canvas-preview"
                  className="block aspect-[1200/630] h-auto w-full"
                  aria-label="OpenGraph Social Card Preview"
                />
              </div>

              {previewPlatform === 'twitter' && (
                <div className="flex flex-col gap-1 border-t border-border bg-card p-3.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formData.website}
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {formData.title} | {formData.role}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {formData.description}
                  </p>
                </div>
              )}

              {previewPlatform === 'whatsapp' && (
                <div className="flex flex-col gap-1 border-t border-border border-l-4 border-l-success bg-card p-3.5">
                  <p className="text-sm font-semibold text-foreground">{formData.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {formData.description}
                  </p>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formData.website}
                  </span>
                </div>
              )}

              {previewPlatform === 'linkedin' && (
                <div className="flex flex-col gap-1 border-t border-border bg-muted/50 p-3.5">
                  <p className="text-sm font-semibold text-foreground">
                    {formData.title} | {formData.role}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formData.website} &middot; 1 min read
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" id="btn-download-og" onClick={handleDownload}>
                <IconDownload className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                Download 1200&times;630 PNG
              </Button>
              <Button type="button" id="btn-copy-og" variant="outline" onClick={handleCopyClipboard}>
                <IconCopy className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                Copy Image
              </Button>
              <Button
                type="button"
                id="btn-save-og"
                variant="secondary"
                disabled={saving}
                onClick={handleSaveToFirestore}
              >
                {saving ? (
                  <IconLoader2
                    className="size-4 animate-spin"
                    stroke={1.75}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                ) : (
                  <IconCloudUpload
                    className="size-4"
                    stroke={1.75}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                )}
                {saving ? 'Saving...' : 'Save as Website SEO'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: DESIGN & CONTENT CONTROLS */}
        <Card className="gap-4 py-5 xl:col-span-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconAdjustments className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Card Design &amp; Content
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-none font-medium">Banner Color Theme</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {Object.values(OG_THEMES).map((t) => {
                  const selected = formData.theme === t.id;
                  return (
                    <Button
                      key={t.id}
                      type="button"
                      aria-pressed={selected}
                      variant={selected ? 'default' : 'outline'}
                      className={`justify-start gap-2.5 ${selected ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, theme: t.id })}
                    >
                      <span
                        className="size-4 shrink-0 rounded-full border border-border/60"
                        style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.accent})` }}
                      />
                      <span>{t.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="og-input-title">Headline / Author Name</Label>
              <Input
                type="text"
                id="og-input-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Vinsensius Arka"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="og-input-role">Professional Role / Subtitle</Label>
              <Input
                type="text"
                id="og-input-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Web & Mobile Developer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="og-input-desc">Bio / Tagline (Social Description)</Label>
              <Textarea
                id="og-input-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short engaging pitch for social media links"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="og-input-tech">Key Technologies (Comma separated)</Label>
              <Input
                type="text"
                id="og-input-tech"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="e.g. Flutter, React, Laravel, Node.js, Java"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="og-input-website">Website URL Display</Label>
              <Input
                type="text"
                id="og-input-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g. vinsensiusarka.id"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
              <Label htmlFor="og-toggle-avatar" className="cursor-pointer text-sm">
                Include Profile Photo Avatar on Banner
              </Label>
              <Switch
                id="og-toggle-avatar"
                checked={formData.includeAvatar}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeAvatar: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
