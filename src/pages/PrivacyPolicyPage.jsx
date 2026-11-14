import { useEffect } from 'react';
import { Link } from 'react-router';
import { usePrivacyPolicy } from '../hooks/usePrivacyPolicy';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingActions } from '../components/layout/FloatingActions';

export function PrivacyPolicyPage() {
  const { policy } = usePrivacyPolicy();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {}
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
      <main className="policy-wrapper">
        <header className="policy-header-section">
          <p className="section__text__p1" id="policy-subtitle">
            {policy.subtitle}
          </p>
          <h1 className="title" id="policy-title">
            {policy.title}
          </h1>
          <div className="policy-meta-badges">
            <span className="policy-pill-badge" id="badge-compliance">
              <i className="fa-solid fa-shield-halved"></i> {policy.complianceBadge}
            </span>
            <span className="policy-pill-badge" id="badge-last-updated">
              <i className="fa-regular fa-calendar-check"></i> Last Updated:{' '}
              {policy.lastUpdated}
            </span>
            <span className="policy-pill-badge" id="badge-developer">
              <i className="fa-solid fa-code"></i> Developer: {policy.developerName}
            </span>
          </div>
        </header>

        <div className="about-containers policy-highlight-grid">
          <div className="details-container color-container">
            <i className="fa-solid fa-user-shield policy-card-icon"></i>
            <h3 id="highlight-1-title">{policy.highlight1Title}</h3>
            <p id="highlight-1-desc">{policy.highlight1Desc}</p>
          </div>
          <div className="details-container color-container">
            <i className="fa-solid fa-lock policy-card-icon"></i>
            <h3 id="highlight-2-title">{policy.highlight2Title}</h3>
            <p id="highlight-2-desc">{policy.highlight2Desc}</p>
          </div>
          <div className="details-container color-container">
            <i className="fa-solid fa-trash-can policy-card-icon"></i>
            <h3 id="highlight-3-title">{policy.highlight3Title}</h3>
            <p id="highlight-3-desc">{policy.highlight3Desc}</p>
          </div>
        </div>

        <div className="details-container policy-toc-box">
          <h3>
            <i className="fa-solid fa-list-ul"></i> Quick Navigation
          </h3>
          <div className="policy-toc-links">
            <a href="#section-1">1. Scope</a>
            <a href="#section-2">2. Data Collection</a>
            <a href="#section-3">3. App Permissions</a>
            <a href="#section-4">4. How We Use Data</a>
            <a href="#section-5">5. Third-Party Services</a>
            <a href="#section-6">6. Data Retention</a>
            <a href="#section-7">7. Data Deletion</a>
            <a href="#section-8">8. Children&apos;s Privacy</a>
            <a href="#section-9">9. Security</a>
            <a href="#section-10">10. Policy Updates</a>
            <a href="#section-11">11. Contact Info</a>
          </div>
        </div>

        <div className="policy-doc-container">
          <div id="section-1" className="policy-block">
            <h2>
              <span>1</span> Introduction &amp; Scope
            </h2>
            <p id="section-1-p1">{policy.sectionScope}</p>
            <p>
              We respect your personal privacy and are committed to safeguarding
              user data through transparency and security. By downloading,
              installing, or accessing any of our mobile applications, you agree
              to the collection and use of information in accordance with this
              Privacy Policy.
            </p>
          </div>

          <div id="section-2" className="policy-block">
            <h2>
              <span>2</span> Information We Collect
            </h2>
            <p id="section-2-intro">{policy.sectionDataCollection}</p>
            <h3>A. Information You Provide Directly</h3>
            <ul>
              <li>
                <strong>Account &amp; Profile Details:</strong> If an application
                includes account registration or authentication, we may collect
                your name, email address, username, phone number, and
                business/store name (for commercial applications such as
                point-of-sale systems).
              </li>
              <li>
                <strong>Operational &amp; Transaction Data:</strong> In business
                productivity applications, data entered by you (such as sales
                records, product catalogs, customer receipts, or inventory) is
                stored securely to enable core app functions.
              </li>
              <li>
                <strong>Customer Support Communications:</strong> If you contact
                us for technical assistance, bug reports, or feature requests, we
                collect your email address, inquiry details, and any screenshots
                or logs you provide.
              </li>
            </ul>
            <h3>B. Information Collected Automatically (Diagnostic Data)</h3>
            <p>
              When you run our mobile apps, automated telemetry and performance
              data may be logged by our systems or verified third-party SDKs to
              diagnose crashes and optimize reliability:
            </p>
            <ul>
              <li>
                <strong>Device Telemetry:</strong> Device model, manufacturer,
                Android OS version, system language, screen resolution, and
                network state.
              </li>
              <li>
                <strong>Crash Logs &amp; Diagnostics:</strong> Real-time stack
                traces, memory state at time of crash, and error reports
                generated via Google Play Console and Firebase Crashlytics.
              </li>
            </ul>
          </div>

          <div id="section-3" className="policy-block">
            <h2>
              <span>3</span> Application Device Permissions
            </h2>
            <p id="section-3-intro">{policy.sectionPermissions}</p>
            <div className="policy-permission-grid">
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <div className="permission-text">
                  <strong>Camera</strong>
                  <p>
                    Used strictly when you scan product barcodes, QR codes, or
                    take item photos. Never accessed in the background.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-folder-open"></i>
                </div>
                <div className="permission-text">
                  <strong>Storage / Files / Media</strong>
                  <p>
                    Used to export PDF/Excel sales reports, create local database
                    backups, or import product images from your gallery.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-wifi"></i>
                </div>
                <div className="permission-text">
                  <strong>Internet / Network State</strong>
                  <p>
                    Required to synchronize transactions with cloud databases,
                    verify license status, and download updates.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div className="permission-text">
                  <strong>Notifications</strong>
                  <p>
                    Used to deliver operational alerts, transaction
                    confirmations, or system status updates.
                  </p>
                </div>
              </div>
            </div>
            <p className="policy-hint">
              <i className="fa-solid fa-circle-info"></i> You can modify or
              revoke any permission at any time via your device settings (
              <em>Settings &gt; Apps &gt; [App Name] &gt; Permissions</em>).
            </p>
          </div>

          <div id="section-4" className="policy-block">
            <h2>
              <span>4</span> How We Use Your Information
            </h2>
            <p>
              We process collected information exclusively for valid, legitimate
              purposes:
            </p>
            <ul>
              <li>
                To operate, maintain, and deliver all core features of our mobile
                applications.
              </li>
              <li>
                To manage authentication, user accounts, and data
                synchronization.
              </li>
              <li>
                To identify, debug, and resolve crashes, errors, and performance
                bottlenecks.
              </li>
              <li>
                To respond to user inquiries, provide customer support, and
                process feedback.
              </li>
              <li>
                To maintain security, prevent unauthorized usage, and protect
                user accounts.
              </li>
              <li>
                To comply with applicable legal obligations and Google Play
                Developer policies.
              </li>
            </ul>
            <div className="policy-alert-box">
              <i className="fa-solid fa-circle-check"></i>
              <div>
                <strong>Strict Commitment:</strong> We do <strong>NOT</strong>{' '}
                sell, rent, monetize, or trade your personal data to data
                brokers, advertising networks, or third parties.
              </div>
            </div>
          </div>

          <div id="section-5" className="policy-block">
            <h2>
              <span>5</span> Third-Party Service Providers
            </h2>
            <p id="section-5-intro">{policy.sectionThirdParty}</p>
            <div className="third-party-cards">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-brands fa-google-play"></i>
                  <div>
                    <strong>Google Play Services</strong>
                    <p>Android core system features, licensing, and security APIs</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://firebase.google.com/policies/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-chart-line"></i>
                  <div>
                    <strong>Google Analytics for Firebase</strong>
                    <p>Aggregated app performance benchmarks and usage metrics</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://firebase.google.com/terms/crashlytics"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-bug"></i>
                  <div>
                    <strong>Firebase Crashlytics</strong>
                    <p>Real-time application crash reporting and stability diagnostics</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-rectangle-ad"></i>
                  <div>
                    <strong>Google AdMob</strong> (if enabled)
                    <p>Displaying non-intrusive in-app advertisements</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
            </div>
          </div>

          <div id="section-6" className="policy-block">
            <h2>
              <span>6</span> Data Retention Policy
            </h2>
            <p>
              We retain personal data and application records only for as long as
              necessary to fulfill the purposes set out in this Privacy Policy,
              maintain active user accounts, or comply with legal, tax, and
              accounting standards. When data is no longer needed, it is
              permanently deleted, anonymized, or securely isolated from further
              processing.
            </p>
          </div>

          <div id="section-7" className="policy-block">
            <h2>
              <span>7</span> User Rights &amp; Data Deletion (Google Play Compliance)
            </h2>
            <p id="section-7-p1">{policy.sectionDataDeletion}</p>
            <ul>
              <li>
                <strong>Right to Access:</strong> You may request a copy of the
                personal information we hold about you.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You may request
                correction of any inaccurate or outdated information.
              </li>
              <li>
                <strong>Right to Erasure (Data Deletion):</strong> You may
                request permanent deletion of your account and associated
                personal data.
              </li>
            </ul>
            <div className="deletion-instruction-card">
              <h3>
                <i className="fa-solid fa-envelope-open-text"></i> How to Request
                Account &amp; Data Deletion
              </h3>
              <p>
                To request permanent deletion of your account and any personal
                data associated with our applications, please send an email to:
              </p>
              <div className="email-highlight">
                <a
                  id="deletion-email-link"
                  href={`mailto:${policy.contactEmail}?subject=Data%20Deletion%20Request`}
                >
                  <i className="fa-solid fa-paper-plane"></i>{' '}
                  <span id="deletion-email-text">{policy.contactEmail}</span>
                </a>
              </div>
              <ul className="deletion-steps">
                <li>
                  <strong>Subject:</strong>{' '}
                  <code>Data Deletion Request - [Application Name]</code>
                </li>
                <li>
                  <strong>Details:</strong> Provide your registered email address
                  or account username.
                </li>
                <li>
                  <strong>Timeline:</strong> Your request will be fulfilled
                  within <strong>30 days</strong>, and you will receive a
                  confirmation email upon completion.
                </li>
              </ul>
            </div>
          </div>

          <div id="section-8" className="policy-block">
            <h2>
              <span>8</span> Children&apos;s Privacy (COPPA Compliance)
            </h2>
            <p>
              Our applications and services are not directed toward children
              under the age of 13. We do not knowingly collect or solicit
              personally identifiable information from children under 13.
            </p>
          </div>

          <div id="section-9" className="policy-block">
            <h2>
              <span>9</span> Security of Your Information
            </h2>
            <p>
              We implement administrative, technical, and physical
              safeguards—including SSL/TLS encryption for all data
              transmissions—to protect your personal information against
              unauthorized access, destruction, loss, or alteration.
            </p>
          </div>

          <div id="section-10" className="policy-block">
            <h2>
              <span>10</span> Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy periodically to reflect
              enhancements in our applications or updates to Google Play
              Developer policies. Any modifications will be posted directly to
              this page with an updated &quot;Last Updated&quot; timestamp at the top.
            </p>
          </div>

          <div id="section-11" className="policy-block">
            <h2>
              <span>11</span> Developer Contact Information
            </h2>
            <p id="section-11-contact">{policy.sectionContact}</p>
            <div className="developer-card">
              <div className="dev-item">
                <i className="fa-solid fa-user"></i>
                <div>
                  <span className="label">Developer</span>
                  <span className="val" id="contact-dev-name">
                    {policy.developerName}
                  </span>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <span className="label">Email</span>
                  <a
                    className="val"
                    id="contact-email-link"
                    href={`mailto:${policy.contactEmail}`}
                  >
                    {policy.contactEmail}
                  </a>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-solid fa-globe"></i>
                <div>
                  <span className="label">Website</span>
                  <a
                    className="val"
                    id="contact-website-link"
                    href={policy.contactWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cleanWebsite}
                  </a>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-brands fa-github"></i>
                <div>
                  <span className="label">GitHub</span>
                  <a
                    className="val"
                    href="https://github.com/vinsensiusarko"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    vinsensiusarko
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="policy-action-buttons">
          <Link to="/" className="btn btn-color-1 btn-wide">
            <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
          </Link>
          <a
            id="bottom-contact-btn"
            href={`mailto:${policy.contactEmail}`}
            className="btn btn-color-2 btn-wide"
          >
            <i className="fa-solid fa-envelope"></i> Contact Developer
          </a>
        </div>
      </main>
      <Footer variant="policy" siteName={policy.developerName || 'Vinsensius Arka'} />
      <FloatingActions />
    </>
  );
}
