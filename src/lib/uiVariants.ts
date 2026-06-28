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

export const episodeRowVariants = cva('transition-colors', {
  variants: {
    selected: {
      true: '',
      false: '',
    },
    layout: {
      horizontal: 'flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4',
      vertical:
        'flex flex-col items-stretch gap-2.5 rounded-[var(--radius-md)] border px-3 py-3 sm:px-4',
    },
  },
  compoundVariants: [
    {
      layout: 'horizontal',
      selected: true,
      className: 'bg-primary/6',
    },
    {
      layout: 'horizontal',
      selected: false,
      className: 'hover:bg-muted/70',
    },
    {
      layout: 'vertical',
      selected: true,
      className: 'border-primary/40 bg-primary/5',
    },
    {
      layout: 'vertical',
      selected: false,
      className: 'border-border bg-card hover:border-primary/25 hover:bg-muted/30',
    },
  ],
  defaultVariants: {
    selected: false,
    layout: 'horizontal',
  },
});
