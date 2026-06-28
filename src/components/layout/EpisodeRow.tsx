import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { episodeRowVariants } from '@/lib/uiVariants';
import StatusBadge, { episodeToStatus } from '@/components/layout/StatusBadge';

interface EpisodeRowProps {
  number: number;
  title: string;
  selected?: boolean;
  finalText?: string;
  aiResult?: string;
  onSelect: () => void;
  action: ReactNode;
  className?: string;
}

export default function EpisodeRow({
  number,
  title,
  selected = false,
  finalText,
  aiResult,
  onSelect,
  action,
  className,
}: EpisodeRowProps) {
  const status = episodeToStatus(finalText, aiResult);

  return (
    <li className={cn(episodeRowVariants({ selected }), className)}>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
      >
        <span
          className={cn(
            'shrink-0 text-body font-bold tabular-nums',
            selected ? 'text-primary' : 'text-foreground',
          )}
        >
          {number}회차
        </span>
        <span className="min-w-0 flex-1 truncate text-body text-muted-foreground">{title}</span>
        {status !== 'empty' && (
          <StatusBadge status={status} className="hidden sm:inline-flex" />
        )}
      </button>
      {action}
    </li>
  );
}
