import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageToolbarProps {
  children: ReactNode;
  className?: string;
}

export default function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {children}
    </div>
  );
}
