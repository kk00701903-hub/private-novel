import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { sectionCardVariants } from '@/lib/uiVariants';
import type { VariantProps } from 'class-variance-authority';

interface SectionCardProps extends VariantProps<typeof sectionCardVariants> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  variant,
  padding,
  noPadding,
}: SectionCardProps) {
  const hasHeader = title || description || action;

  return (
    <section className={cn(sectionCardVariants({ variant, padding: noPadding ? 'none' : padding ?? 'none' }), className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            {title && <h2 className="text-title font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!noPadding && !hasHeader && 'p-4 sm:p-5', hasHeader && 'p-4 sm:p-5', bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
