import { useMemo, useRef } from 'react';
import { cn } from 'cn';
import { m } from 'motion/react';
import { IconCode, IconStack2 } from '@tabler/icons-react';
import { SkillIcon } from '@/components/common/SkillIcon';
import { ParallaxLayer, SectionWatermark } from '@/components/common/ParallaxLayer';
import { TACTILE_SPRING } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ExperienceSection({ skills }) {
  const sectionRef = useRef(null);
  const languages = useMemo(
    () => (skills || []).filter((s) => s.category === 'language'),
    [skills]
  );
  const tools = useMemo(
    () => (skills || []).filter((s) => s.category === 'framework_tool'),
    [skills]
  );

  const renderSkillCard = (skill) => {
    const level = skill.level || 'Experienced';
    const isExperienced = level.toLowerCase() === 'experienced';
    const itemKey = (skill.name || skill.id || '').toLowerCase().trim();

    return (
      <m.div
        whileHover={{ y: -2 }}
        transition={TACTILE_SPRING}
        className="skill-item flex items-center gap-3 rounded-lg border border-border bg-background/70 px-3.5 py-3 transition-colors hover:border-season-border"
        key={itemKey}
      >
        <div className="skill-icon-box flex size-10 shrink-0 items-center justify-center rounded-lg border border-season-border bg-season-surface text-season-foreground">
          <SkillIcon skill={skill} size="1.25rem" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {skill.name}
          </h3>
          <Badge
            variant={isExperienced ? 'secondary' : 'outline'}
            className={cn(
              'mt-1 text-[11px] font-medium transition-colors',
              isExperienced
                ? 'experienced border-status-success-border bg-status-success-bg text-status-success-fg'
                : 'intermediate border-status-warn-border bg-status-warn-bg text-status-warn-fg'
            )}
          >
            {level}
          </Badge>
        </div>
      </m.div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="reveal-on-scroll relative z-10 overflow-x-clip border-y border-border bg-muted/40 py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionWatermark targetRef={sectionRef} label="03" align="right" />

        <div className="relative z-10 flex flex-col gap-1.5">
          <p className="font-mono text-xs uppercase tracking-wider text-season-foreground">
            Technical Stack
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Experience &amp; Skills
          </h2>
        </div>

        <div className="relative z-10 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ParallaxLayer targetRef={sectionRef} offset={-16} mobileFactor={0}>
            <Card className="h-full">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2.5 font-display text-lg">
                  <IconCode className="size-5 text-season-accent" aria-hidden="true" />
                  Programming Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No programming languages listed yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {languages.map(renderSkillCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </ParallaxLayer>

          <ParallaxLayer targetRef={sectionRef} offset={16} mobileFactor={0}>
            <Card className="h-full">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2.5 font-display text-lg">
                  <IconStack2 className="size-5 text-season-accent" aria-hidden="true" />
                  Frameworks &amp; Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {tools.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No frameworks or tools listed yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tools.map(renderSkillCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
