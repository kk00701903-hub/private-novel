import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import type { ScreenId } from '@/types/novel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkSelectorProps {
  screen: ScreenId;
  value: string | null;
  onChange: (workId: string) => void;
  className?: string;
}

export default function WorkSelector({ screen, value, onChange, className }: WorkSelectorProps) {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const resolved = value ?? resolveWorkId(screen, works, settings);

  if (works.length === 0) {
    return <p className="text-sm text-muted-foreground">작품이 없습니다. 작품 관리에서 추가하세요.</p>;
  }

  return (
    <Select value={resolved ?? undefined} onValueChange={onChange}>
      <SelectTrigger className={className ?? 'w-full max-w-xs'}>
        <SelectValue placeholder="작품 선택" />
      </SelectTrigger>
      <SelectContent>
        {works.map((w) => (
          <SelectItem key={w.id} value={w.id}>
            {w.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
