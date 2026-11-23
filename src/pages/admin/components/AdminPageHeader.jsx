import { Badge } from '../../../components/ui/badge';

export function AdminPageHeader({ title, description, badge, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {badge ? (
            <Badge variant="secondary" className="font-mono text-xs font-medium tabular-nums">
              {badge}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
