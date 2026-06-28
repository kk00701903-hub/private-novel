import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { episodeRowVariants } from '@/lib/uiVariants';
import StatusBadge, { episodeToStatus } from '@/components/layout/StatusBadge';
import type { VariantProps } from 'class-variance-authority';

type EpisodeStatus = 'saved' | 'draft' | 'empty';

interface EpisodeRowProps extends VariantProps<typeof episodeRowVariants> {
  number: number;
  title: string;
  selected?: boolean;
  finalText?: string;
  aiResult?: string;
  status?: EpisodeStatus;
  onSelect: () => void;
  action?: ReactNode;
  className?: string;
}

export default function EpisodeRow({
  number,
  title,
  selected = false,
  finalText,
  aiResult,
  status: statusOverride,
  onSelect,
  action,
  layout = 'horizontal',
  className,
}: EpisodeRowProps) {
  const status = statusOverride ?? episodeToStatus(finalText, aiResult);
  const isVertical = layout === 'vertical';

  return (
    <li className={cn(episodeRowVariants({ selected, layout }), className)}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'min-w-0 text-left',
          isVertical ? 'flex w-full flex-col gap-1' : 'flex min-w-0 flex-1 items-center gap-2',
        )}
      >
        {isVertical ? (
          <>
            <div className="flex w-full items-center gap-2">
              <span
                className={cn(
                  'shrink-0 text-body font-bold tabular-nums',
                  selected ? 'text-primary' : 'text-foreground',
                )}
              >
                {number}회차
              </span>
              {status !== 'empty' && <StatusBadge status={status} />}
            </div>
            <span className="line-clamp-2 w-full text-body text-muted-foreground">{title}</span>
          </>
        ) : (
          <>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-body',
                selected ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {number}회차 {title}
            </span>
            {status !== 'empty' && <StatusBadge status={status} className="shrink-0" />}
          </>
        )}
      </button>
      {action != null && (
        <div className={cn('shrink-0', isVertical && 'w-full')}>{action}</div>
      )}
    </li>
  );
}
