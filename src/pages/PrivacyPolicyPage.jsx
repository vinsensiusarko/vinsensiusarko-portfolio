import { useEffect } from 'react';
import { Link } from 'react-router';
import {
  IconShieldCheck,
  IconCalendarCheck,
  IconCode,
  IconUserShield,
  IconLock,
  IconTrash,
  IconList,
  IconCamera,
  IconFolderOpen,
  IconWifi,
  IconBell,
  IconInfoCircle,
  IconCircleCheck,
  IconBrandGooglePlay,
  IconChartLine,
  IconBug,
  IconAd,
  IconExternalLink,
  IconMailOpened,
  IconSend,
  IconUser,
  IconMail,
  IconWorld,
  IconBrandGithub,
  IconArrowLeft
} from '@tabler/icons-react';
import { usePrivacyPolicy } from '@/hooks/usePrivacyPolicy';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const TOC_ITEMS = [
  { href: '#section-1', label: '1. Scope' },
  { href: '#section-2', label: '2. Data Collection' },
  { href: '#section-3', label: '3. App Permissions' },
  { href: '#section-4', label: '4. How We Use Data' },
  { href: '#section-5', label: '5. Third-Party Services' },
  { href: '#section-6', label: '6. Data Retention' },
  { href: '#section-7', label: '7. Data Deletion' },
  { href: '#section-8', label: "8. Children's Privacy" },
  { href: '#section-9', label: '9. Security' },
  { href: '#section-10', label: '10. Policy Updates' },
  { href: '#section-11', label: '11. Contact Info' }
];

const PERMISSIONS = [
  {
    title: 'Camera',
    desc: 'Used strictly when you scan product barcodes, QR codes, or take item photos. Never accessed in the background.',
    Icon: IconCamera
  },
  {
    title: 'Storage / Files / Media',
    desc: 'Used to export PDF/Excel sales reports, create local database backups, or import product images from your gallery.',
    Icon: IconFolderOpen
  },
  {
    title: 'Internet / Network State',
    desc: 'Required to synchronize transactions with cloud databases, verify license status, and download updates.',
    Icon: IconWifi
  },
  {
    title: 'Notifications',
    desc: 'Used to deliver operational alerts, transaction confirmations, or system status updates.',
    Icon: IconBell
  }
];

const THIRD_PARTIES = [
  {
    name: 'Google Play Services',
    desc: 'Android core system features, licensing, and security APIs',
    href: 'https://policies.google.com/privacy',
    Icon: IconBrandGooglePlay
  },
  {
    name: 'Google Analytics for Firebase',
    desc: 'Aggregated app performance benchmarks and usage metrics',
    href: 'https://firebase.google.com/policies/analytics',
    Icon: IconChartLine
  },
  {
    name: 'Firebase Crashlytics',
    desc: 'Real-time application crash reporting and stability diagnostics',
    href: 'https://firebase.google.com/terms/crashlytics',
    Icon: IconBug
  },
  {
    name: 'Google AdMob (if enabled)',
    desc: 'Displaying non-intrusive in-app advertisements',
    href: 'https://policies.google.com/technologies/ads',
    Icon: IconAd
  }
];

function SectionHeading({ number, title }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-season-border bg-season-surface font-mono text-xs font-semibold text-season-foreground">
        {number}
      </span>
      <span>{title}</span>
    </h2>
  );
}

export function PrivacyPolicyPage() {
  const { policy, loading } = usePrivacyPolicy();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    document.title = `${policy.title || 'Privacy Policy'} - ${policy.developerName || 'Vinsensius Arka'}`;
  }, [policy.title, policy.developerName]);

  const cleanWebsite = String(policy.contactWebsite || 'https://vinsensiusarka.id')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  return (
    <>
      <Navbar variant="policy" siteName={policy.developerName || 'Vinsensius Arka'} />

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-12 lg:py-16 flex flex-col gap-10">
        {loading && !policy?.title ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-4">
              <p
                className="font-mono text-xs uppercase tracking-wider text-season-foreground"
                id="policy-subtitle"
              >
                {policy.subtitle}
              </p>
              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground"
                id="policy-title"
              >
                {policy.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" id="badge-compliance" className="gap-1.5">
                  <IconShieldCheck className="size-3.5 text-season-accent" aria-hidden="true" />
                  {policy.complianceBadge}
                </Badge>
                <Badge variant="outline" id="badge-last-updated" className="gap-1.5">
                  <IconCalendarCheck className="size-3.5" aria-hidden="true" />
                  Last Updated: {policy.lastUpdated}
                </Badge>
                <Badge variant="outline" id="badge-developer" className="gap-1.5">
                  <IconCode className="size-3.5" aria-hidden="true" />
                  Developer: {policy.developerName}
                </Badge>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-season-border bg-season-surface text-season-foreground mb-1">
                    <IconUserShield className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="font-display text-base" id="highlight-1-title">
                    {policy.highlight1Title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" id="highlight-1-desc">
                    {policy.highlight1Desc}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-season-border bg-season-surface text-season-foreground mb-1">
                    <IconLock className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="font-display text-base" id="highlight-2-title">
                    {policy.highlight2Title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" id="highlight-2-desc">
                    {policy.highlight2Desc}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-season-border bg-season-surface text-season-foreground mb-1">
                    <IconTrash className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="font-display text-base" id="highlight-3-title">
                    {policy.highlight3Title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" id="highlight-3-desc">
                    {policy.highlight3Desc}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <IconList className="size-4 text-season-accent" aria-hidden="true" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TOC_ITEMS.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="inline-flex min-h-11 sm:min-h-9 items-center rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-season-border hover:bg-season-surface hover:text-season-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-10">
              <section id="section-1" className="flex flex-col gap-3 scroll-mt-24">
                <SectionHeading number="1" title="Introduction & Scope" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-1-p1">
                  {policy.sectionScope}
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We respect your personal privacy and are committed to safeguarding user data
                  through transparency and security. By downloading, installing, or accessing any
                  of our mobile applications, you agree to the collection and use of information in
                  accordance with this Privacy Policy.
                </p>
              </section>

              <Separator />

              <section id="section-2" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="2" title="Information We Collect" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-2-intro">
                  {policy.sectionDataCollection}
                </p>
                <h3 className="font-display text-base font-semibold text-foreground">
                  A. Information You Provide Directly
                </h3>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm sm:text-base text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Account &amp; Profile Details:</strong> If
                    an application includes account registration or authentication, we may collect
                    your name, email address, username, phone number, and business/store name (for
                    commercial applications such as point-of-sale systems).
                  </li>
                  <li>
                    <strong className="text-foreground">Operational &amp; Transaction Data:</strong>{' '}
                    In business productivity applications, data entered by you (such as sales
                    records, product catalogs, customer receipts, or inventory) is stored securely
                    to enable core app functions.
                  </li>
                  <li>
                    <strong className="text-foreground">Customer Support Communications:</strong> If
                    you contact us for technical assistance, bug reports, or feature requests, we
                    collect your email address, inquiry details, and any screenshots or logs you
                    provide.
                  </li>
                </ul>
                <h3 className="font-display text-base font-semibold text-foreground">
                  B. Information Collected Automatically (Diagnostic Data)
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  When you run our mobile apps, automated telemetry and performance data may be
                  logged by our systems or verified third-party SDKs to diagnose crashes and
                  optimize reliability:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm sm:text-base text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Device Telemetry:</strong> Device model,
                    manufacturer, Android OS version, system language, screen resolution, and
                    network state.
                  </li>
                  <li>
                    <strong className="text-foreground">Crash Logs &amp; Diagnostics:</strong>{' '}
                    Real-time stack traces, memory state at time of crash, and error reports
                    generated via Google Play Console and Firebase Crashlytics.
                  </li>
                </ul>
              </section>

              <Separator />

              <section id="section-3" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="3" title="Application Device Permissions" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-3-intro">
                  {policy.sectionPermissions}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {PERMISSIONS.map(({ title, desc, Icon }) => (
                    <Card key={title}>
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <strong className="text-sm text-foreground">{title}</strong>
                          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                            {desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <IconInfoCircle className="size-4 shrink-0 text-season-accent" aria-hidden="true" />
                  <span>
                    You can modify or revoke any permission at any time via your device settings (
                    <em>Settings &gt; Apps &gt; [App Name] &gt; Permissions</em>).
                  </span>
                </p>
              </section>

              <Separator />

              <section id="section-4" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="4" title="How We Use Your Information" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We process collected information exclusively for valid, legitimate purposes:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm sm:text-base text-muted-foreground">
                  <li>To operate, maintain, and deliver all core features of our mobile applications.</li>
                  <li>To manage authentication, user accounts, and data synchronization.</li>
                  <li>To identify, debug, and resolve crashes, errors, and performance bottlenecks.</li>
                  <li>To respond to user inquiries, provide customer support, and process feedback.</li>
                  <li>To maintain security, prevent unauthorized usage, and protect user accounts.</li>
                  <li>To comply with applicable legal obligations and Google Play Developer policies.</li>
                </ul>
                <Alert className="border-status-success-border bg-status-success-bg text-status-success-fg">
                  <IconCircleCheck className="size-4" aria-hidden="true" />
                  <AlertTitle>Strict Commitment</AlertTitle>
                  <AlertDescription className="text-foreground">
                    We do <strong>NOT</strong> sell, rent, monetize, or trade your personal data to
                    data brokers, advertising networks, or third parties.
                  </AlertDescription>
                </Alert>
              </section>

              <Separator />

              <section id="section-5" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="5" title="Third-Party Service Providers" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-5-intro">
                  {policy.sectionThirdParty}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THIRD_PARTIES.map(({ name, desc, href, Icon }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-5 shrink-0 text-season-accent" aria-hidden="true" />
                        <div className="flex flex-col gap-0.5">
                          <strong className="text-sm text-foreground">{name}</strong>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <IconExternalLink
                        className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </section>

              <Separator />

              <section id="section-6" className="flex flex-col gap-3 scroll-mt-24">
                <SectionHeading number="6" title="Data Retention Policy" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We retain personal data and application records only for as long as necessary to
                  fulfill the purposes set out in this Privacy Policy, maintain active user
                  accounts, or comply with legal, tax, and accounting standards. When data is no
                  longer needed, it is permanently deleted, anonymized, or securely isolated from
                  further processing.
                </p>
              </section>

              <Separator />

              <section id="section-7" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="7" title="User Rights & Data Deletion (Google Play Compliance)" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-7-p1">
                  {policy.sectionDataDeletion}
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm sm:text-base text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Right to Access:</strong> You may request a
                    copy of the personal information we hold about you.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to Rectification:</strong> You may
                    request correction of any inaccurate or outdated information.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to Erasure (Data Deletion):</strong>{' '}
                    You may request permanent deletion of your account and associated personal data.
                  </li>
                </ul>

                <Card className="border-season-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 font-display text-base">
                      <IconMailOpened className="size-4 text-season-accent" aria-hidden="true" />
                      How to Request Account &amp; Data Deletion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                    <p>
                      To request permanent deletion of your account and any personal data associated
                      with our applications, please send an email to:
                    </p>
                    <div>
                      <Button asChild size="sm">
                        <a
                          id="deletion-email-link"
                          href={`mailto:${policy.contactEmail}?subject=Data%20Deletion%20Request`}
                        >
                          <IconSend data-icon="inline-start" aria-hidden="true" />
                          <span id="deletion-email-text">{policy.contactEmail}</span>
                        </a>
                      </Button>
                    </div>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                      <li>
                        <strong className="text-foreground">Subject:</strong>{' '}
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                          Data Deletion Request - [Application Name]
                        </code>
                      </li>
                      <li>
                        <strong className="text-foreground">Details:</strong> Provide your
                        registered email address or account username.
                      </li>
                      <li>
                        <strong className="text-foreground">Timeline:</strong> Your request will be
                        fulfilled within <strong className="text-foreground">30 days</strong>, and
                        you will receive a confirmation email upon completion.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <Separator />

              <section id="section-8" className="flex flex-col gap-3 scroll-mt-24">
                <SectionHeading number="8" title="Children's Privacy (COPPA Compliance)" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our applications and services are not directed toward children under the age of
                  13. We do not knowingly collect or solicit personally identifiable information
                  from children under 13.
                </p>
              </section>

              <Separator />

              <section id="section-9" className="flex flex-col gap-3 scroll-mt-24">
                <SectionHeading number="9" title="Security of Your Information" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We implement administrative, technical, and physical safeguards, including
                  SSL/TLS encryption for all data transmissions, to protect your personal
                  information against unauthorized access, destruction, loss, or alteration.
                </p>
              </section>

              <Separator />

              <section id="section-10" className="flex flex-col gap-3 scroll-mt-24">
                <SectionHeading number="10" title="Changes to This Privacy Policy" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We may update our Privacy Policy periodically to reflect enhancements in our
                  applications or updates to Google Play Developer policies. Any modifications will
                  be posted directly to this page with an updated &quot;Last Updated&quot; timestamp
                  at the top.
                </p>
              </section>

              <Separator />

              <section id="section-11" className="flex flex-col gap-4 scroll-mt-24">
                <SectionHeading number="11" title="Developer Contact Information" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground" id="section-11-contact">
                  {policy.sectionContact}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconUser className="size-4 text-season-accent shrink-0" aria-hidden="true" />
                      <div>
                        <span className="block text-xs text-muted-foreground">Developer</span>
                        <span className="text-sm font-medium text-foreground" id="contact-dev-name">
                          {policy.developerName}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconMail className="size-4 text-season-accent shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="block text-xs text-muted-foreground">Email</span>
                        <a
                          className="block truncate text-sm font-medium text-foreground hover:text-season-accent"
                          id="contact-email-link"
                          href={`mailto:${policy.contactEmail}`}
                        >
                          {policy.contactEmail}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconWorld className="size-4 text-season-accent shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="block text-xs text-muted-foreground">Website</span>
                        <a
                          className="block truncate text-sm font-medium text-foreground hover:text-season-accent"
                          id="contact-website-link"
                          href={policy.contactWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cleanWebsite}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconBrandGithub className="size-4 text-season-accent shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="block text-xs text-muted-foreground">GitHub</span>
                        <a
                          className="block truncate text-sm font-medium text-foreground hover:text-season-accent"
                          href="https://github.com/vinsensiusarko"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          vinsensiusarko
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button asChild size="lg">
                <Link to="/">
                  <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
                  Back to Portfolio
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a id="bottom-contact-btn" href={`mailto:${policy.contactEmail}`}>
                  <IconMail data-icon="inline-start" aria-hidden="true" />
                  Contact Developer
                </a>
              </Button>
            </div>
          </>
        )}
      </main>

      <Footer variant="policy" siteName={policy.developerName || 'Vinsensius Arka'} />
      <FloatingActions />
    </>
  );
}
