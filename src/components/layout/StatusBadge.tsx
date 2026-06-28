import { cn } from '@/lib/utils';
import { statusBadgeVariants } from '@/lib/uiVariants';
import type { VariantProps } from 'class-variance-authority';

type Status = NonNullable<VariantProps<typeof statusBadgeVariants>['status']>;

const LABELS: Record<Status, string> = {
  saved: '저장됨',
  draft: '집필됨',
  empty: '비어 있음',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showLabel?: boolean;
}

export default function StatusBadge({ status, className, showLabel = true }: StatusBadgeProps) {
  if (status === 'empty' && !showLabel) return null;
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {LABELS[status]}
    </span>
  );
}

export function episodeToStatus(finalText?: string, aiResult?: string): Status {
  if (finalText?.trim()) return 'saved';
  if (aiResult?.trim()) return 'draft';
  return 'empty';
}
