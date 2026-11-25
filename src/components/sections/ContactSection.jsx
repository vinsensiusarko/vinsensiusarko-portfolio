import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  IconMail,
  IconCopy,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandX,
  IconArrowUpRight,
  IconSend,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { AvailabilityBadge } from '@/components/common/AvailabilityBadge';
import {
  MESSAGE_TOPICS,
  validateContactForm,
  submitContactMessage,
  buildMailtoFallbackUrl,
  getCooldownRemainingMs
} from '@/services/contactMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const INITIAL_FORM = {
  name: '',
  email: '',
  topic: 'freelance',
  message: '',
  website: ''
};

export function ContactSection({ contactSettings = {}, siteSettings = {} }) {
  const email = contactSettings.email || 'me@vinsensiusarka.id';
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(() =>
    Math.ceil(getCooldownRemainingMs() / 1000)
  );
  const topicRefs = useRef([]);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const successRef = useRef(null);
  const shouldFocusNameRef = useRef(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      const next = Math.ceil(getCooldownRemainingMs() / 1000);
      setCooldownSeconds(next);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (submittedInfo) {
      successRef.current?.focus();
    } else if (shouldFocusNameRef.current) {
      shouldFocusNameRef.current = false;
      nameInputRef.current?.focus();
    }
  }, [submittedInfo]);

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      }
      toast.success(`Copied ${email} to clipboard`);
    } catch {
      toast.error('Failed to copy email address');
    }
  };

  const handleCopyDraftMessage = async () => {
    const draft = String(form.message ?? '').trim();
    if (!draft) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft);
        toast.success('Message copied to clipboard');
      } else {
        toast.error('Clipboard is unavailable in this browser');
      }
    } catch {
      toast.error('Could not copy message');
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleTopicKeyDown = (e, currentIndex) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % MESSAGE_TOPICS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + MESSAGE_TOPICS.length) % MESSAGE_TOPICS.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      updateField('topic', MESSAGE_TOPICS[nextIndex].value);
      topicRefs.current[nextIndex]?.focus();
    }
  };

  const focusFirstInvalidField = (errors) => {
    if (errors.name) nameInputRef.current?.focus();
    else if (errors.email) emailInputRef.current?.focus();
    else if (errors.message) messageInputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || cooldownSeconds > 0) return;

    const validation = validateContactForm(form);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      focusFirstInvalidField(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const result = await submitContactMessage(form);
      if (result.ok) {
        setSubmittedInfo({
          name: validation.sanitized.name,
          email: validation.sanitized.email
        });
        setForm(INITIAL_FORM);
        setCooldownSeconds(Math.ceil(getCooldownRemainingMs() / 1000));
        toast.success('Message sent! Thanks for reaching out.');
      } else {
        if (result.errors) {
          setFieldErrors(result.errors);
          focusFirstInvalidField(result.errors);
        }
        if (result.code === 'cooldown') {
          setCooldownSeconds(Math.ceil(getCooldownRemainingMs() / 1000));
        }
        const msg = result.message || 'Could not send your message right now.';
        setSubmitError({ code: result.code || 'network', message: msg });
        toast.error(msg);
      }
    } catch {
      const msg = 'Could not send your message right now. Use the email button below.';
      setSubmitError({ code: 'network', message: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const showMailtoFallback =
    Boolean(submitError) &&
    submitError.code !== 'cooldown' &&
    submitError.code !== 'validation';

  const fallbackMailto = showMailtoFallback
    ? buildMailtoFallbackUrl({
        toEmail: email,
        name: form.name,
        email: form.email,
        topic: form.topic,
        message: form.message
      })
    : '';

  const socialChannels = [
    {
      label: 'LinkedIn',
      handle: 'Vinsensius Arka',
      ariaLabel: 'LinkedIn profile',
      href: contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/',
      Icon: IconBrandLinkedin
    },
    {
      label: 'GitHub',
      handle: 'vinsensiusarko',
      ariaLabel: 'GitHub profile',
      href: contactSettings.github || 'https://github.com/vinsensiusarko',
      Icon: IconBrandGithub
    },
    {
      label: 'Instagram',
      handle: '@vinsensiusarko',
      ariaLabel: 'Instagram profile',
      href: contactSettings.instagram || 'https://www.instagram.com/vinsensiusarko/',
      Icon: IconBrandInstagram
    },
    {
      label: 'Facebook',
      handle: 'Vinsensius Arka',
      ariaLabel: 'Facebook profile',
      href: contactSettings.facebook || 'https://www.facebook.com/vinsensiusarko/',
      Icon: IconBrandFacebook
    },
    {
      label: 'X / Twitter',
      handle: '@vinsensiusarko',
      ariaLabel: 'X Twitter profile',
      href: contactSettings.twitter || 'https://x.com/vinsensiusarko',
      Icon: IconBrandX
    }
  ];

  return (
    <section
      id="contact"
      className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs uppercase tracking-wider text-season-foreground">
              Get In Touch
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Contact Me
            </h2>
          </div>

          <AvailabilityBadge
            status={siteSettings.availabilityStatus}
            text={siteSettings.availabilityText}
            className="self-start"
          />

          <p className="max-w-md text-sm sm:text-base leading-relaxed text-muted-foreground">
            Open to web and mobile engineering roles, freelance product builds, and technical
            collaborations. Send a message directly or reach out via email and social channels.
          </p>

          <Card className="border-season-border/60">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-season-border bg-season-surface text-season-foreground">
                  <IconMail className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    aria-label={`Send email to ${email}`}
                    className="mt-0.5 block break-all sm:break-normal font-medium text-foreground transition-colors hover:text-season-accent"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild size="sm" className="min-h-11 sm:min-h-10">
                  <a href={`mailto:${email}`}>
                    <IconMail data-icon="inline-start" aria-hidden="true" />
                    Send Email
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  title="Copy email to clipboard"
                  className="min-h-11 sm:min-h-10"
                >
                  <IconCopy data-icon="inline-start" aria-hidden="true" />
                  Copy Address
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
            {socialChannels.map(({ label, handle, ariaLabel, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                className="group flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-colors group-hover:border-season-border group-hover:bg-season-surface group-hover:text-season-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] text-muted-foreground">{label}</span>
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {handle}
                  </span>
                </div>
                <IconArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <Card className="border-border bg-card">
            <CardContent className="p-5 sm:p-7">
              {submittedInfo ? (
                <div
                  ref={successRef}
                  tabIndex={-1}
                  role="status"
                  className="flex flex-col items-start gap-4 py-4 outline-none"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl border border-status-success-border bg-status-success-bg text-status-success-fg">
                    <IconCircleCheck className="size-6" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                      Message Received
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Thanks, <span className="font-medium text-foreground">{submittedInfo.name}</span>.
                      Your inquiry has been saved and I will follow up at{' '}
                      <span className="font-mono text-xs text-foreground">{submittedInfo.email}</span>.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 sm:min-h-9"
                    onClick={() => {
                      shouldFocusNameRef.current = true;
                      setSubmittedInfo(null);
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form
                  id="direct-contact-form"
                  noValidate
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                      Send a Direct Message
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share your project scope, role details, or question directly here.
                    </p>
                  </div>

                  {/* Topic Radio Pills */}
                  <div className="flex flex-col gap-2">
                    <span
                      id="contact-topic-label"
                      className="text-sm font-medium text-foreground"
                    >
                      Inquiry Topic
                    </span>
                    <div
                      role="radiogroup"
                      aria-labelledby="contact-topic-label"
                      className="flex flex-wrap gap-2"
                    >
                      {MESSAGE_TOPICS.map(({ value, label }, idx) => {
                        const isSelected = form.topic === value;
                        return (
                          <button
                            key={value}
                            ref={(el) => {
                              topicRefs.current[idx] = el;
                            }}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => updateField('topic', value)}
                            onKeyDown={(e) => handleTopicKeyDown(e, idx)}
                            className={`inline-flex min-h-11 sm:min-h-9 items-center rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-season-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="contact-name">Your Name</Label>
                      <Input
                        ref={nameInputRef}
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        placeholder="Your full name"
                        value={form.name}
                        aria-required="true"
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                        className="h-11 sm:h-9"
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                      {fieldErrors.name ? (
                        <p id="contact-name-error" className="text-xs font-medium text-destructive-text">
                          {fieldErrors.name}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="contact-email">Email Address</Label>
                      <Input
                        ref={emailInputRef}
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={160}
                        placeholder="you@domain.com"
                        value={form.email}
                        aria-required="true"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                        className="h-11 sm:h-9"
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                      {fieldErrors.email ? (
                        <p id="contact-email-error" className="text-xs font-medium text-destructive-text">
                          {fieldErrors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {[...form.message].length} / 2000
                      </span>
                    </div>
                    <Textarea
                      ref={messageInputRef}
                      id="contact-message"
                      name="message"
                      rows={5}
                      maxLength={2000}
                      placeholder="Tell me a bit about what you are building, timeline, or role..."
                      value={form.message}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                      onChange={(e) => updateField('message', e.target.value)}
                    />
                    {fieldErrors.message ? (
                      <p id="contact-message-error" className="text-xs font-medium text-destructive-text">
                        {fieldErrors.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Honeypot field hardened against password-manager autofill */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="contact-hp-url">Leave this field empty</label>
                    <input
                      id="contact-hp-url"
                      name="contact_hp_url"
                      type="text"
                      tabIndex={-1}
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      value={form.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </div>

                  {submitError ? (
                    <div
                      role="alert"
                      className="flex flex-col gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-foreground"
                    >
                      <div className="flex items-start gap-2">
                        <IconAlertCircle
                          className="mt-0.5 size-4 shrink-0 text-destructive-text"
                          aria-hidden="true"
                        />
                        <span>{submitError.message}</span>
                      </div>
                      {showMailtoFallback ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="min-h-11 sm:min-h-9"
                          >
                            <a href={fallbackMailto}>
                              <IconMail data-icon="inline-start" aria-hidden="true" />
                              Open in Email Client
                            </a>
                          </Button>
                          {form.message.trim() ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="min-h-11 sm:min-h-9"
                              onClick={handleCopyDraftMessage}
                            >
                              <IconCopy data-icon="inline-start" aria-hidden="true" />
                              Copy Message
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-muted-foreground">
                      Stored privately and read only by the site owner.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || cooldownSeconds > 0}
                      className="w-full sm:w-auto min-h-11"
                    >
                      {submitting ? (
                        <>
                          <IconLoader2
                            className="size-4 animate-spin"
                            data-icon="inline-start"
                            aria-hidden="true"
                          />
                          Sending...
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <span>Wait {cooldownSeconds}s</span>
                      ) : (
                        <>
                          <IconSend data-icon="inline-start" aria-hidden="true" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
