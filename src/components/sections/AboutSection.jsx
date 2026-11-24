import { IconBriefcase, IconSchool } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { getWebpSource } from '@/utils/getWebpSource';

export function AboutSection({ siteSettings }) {
  const aboutImgSrc = siteSettings.aboutImage || '/assets/images/arko-about.jpg';
  const aboutWebpSrc = getWebpSource(aboutImgSrc);

  return (
    <section
      id="about"
      className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
    >
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs uppercase tracking-wider text-season-foreground">
          Background
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          About Me
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card p-2">
            <picture>
              {aboutWebpSrc ? <source srcSet={aboutWebpSrc} type="image/webp" /> : null}
              <img
                id="about-img"
                src={aboutImgSrc}
                alt={`${siteSettings.name || 'Vinsensius Arka'} personal photo`}
                width="380"
                height="475"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-lg object-cover bg-muted"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/arko-about.jpg';
                }}
              />
            </picture>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <p className="max-w-prose text-base sm:text-lg leading-relaxed text-muted-foreground">
            {siteSettings.bioText}
          </p>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                <IconBriefcase className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Experience
                </h3>
                <p className="text-sm font-medium text-foreground">
                  {siteSettings.expYears || '3+ years'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {siteSettings.expSub || 'Web & Mobile Development'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                <IconSchool className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Education
                </h3>
                <p className="text-sm font-medium text-foreground">
                  {siteSettings.eduDegree || 'Bachelors Degree'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {siteSettings.eduMajor || 'Computer Science'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
