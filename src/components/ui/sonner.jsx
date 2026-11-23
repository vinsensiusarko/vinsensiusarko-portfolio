import { Toaster as Sonner } from 'sonner';
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader2
} from '@tabler/icons-react';
import { useTheme } from '@/context/ThemeContext';

export function Toaster({ ...props }) {
  let theme = 'system';
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme) theme = themeCtx.theme;
  } catch {
    // fallback if rendered outside ThemeProvider
  }

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="size-4" />,
        info: <IconInfoCircle className="size-4" />,
        warning: <IconAlertTriangle className="size-4" />,
        error: <IconAlertOctagon className="size-4" />,
        loading: <IconLoader2 className="size-4 animate-spin" />
      }}
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)'
      }}
      {...props}
    />
  );
}
