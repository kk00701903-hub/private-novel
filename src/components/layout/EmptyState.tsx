import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-3 text-muted-foreground/50">{icon}</div>}
      <p className="text-body font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-caption text-muted-foreground">{description}</p>}
    </div>
  );
}
