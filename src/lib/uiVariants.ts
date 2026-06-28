import { cva } from 'class-variance-authority';

export const sectionCardVariants = cva(
  'overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-app-sm',
  {
    variants: {
      variant: {
        default: '',
        flat: 'shadow-none',
        editor: 'bg-editor border-border/80',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'none',
    },
  },
);

export const statusBadgeVariants = cva(
  'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-caption font-medium',
  {
    variants: {
      status: {
        saved: 'bg-success/10 text-success',
        draft: 'bg-warning/12 text-warning',
        empty: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      status: 'empty',
    },
  },
);

export const episodeRowVariants = cva(
  'flex items-center gap-2 px-3 py-2.5 transition-colors sm:gap-3 sm:px-4',
  {
    variants: {
      selected: {
        true: 'bg-primary/6',
        false: 'hover:bg-muted/70',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
