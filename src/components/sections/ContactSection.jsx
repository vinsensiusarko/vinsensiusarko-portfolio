import { toast } from 'sonner';
import {
  IconMail,
  IconCopy,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandX,
  IconArrowUpRight
} from '@tabler/icons-react';
import { AvailabilityBadge } from '@/components/common/AvailabilityBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ContactSection({ contactSettings = {}, siteSettings = {} }) {
  const email = contactSettings.email || 'me@vinsensiusarka.id';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
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
            collaborations. Reach out directly by email or via any platform here.
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
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {socialChannels.map(({ label, handle, ariaLabel, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className="group flex min-h-[4.5rem] items-center gap-3.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-colors group-hover:border-season-border group-hover:bg-season-surface group-hover:text-season-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className="block truncate text-sm font-semibold text-foreground">
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
    </section>
  );
}
