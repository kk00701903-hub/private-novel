import type { Work } from '@/types/novel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EpisodeSelectorProps {
  work: Work | undefined;
  episodeNumber: number;
  onChange: (n: number) => void;
}

export default function EpisodeSelector({ work, episodeNumber, onChange }: EpisodeSelectorProps) {
  if (!work) return null;
  const max = work.totalEpisodes;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={episodeNumber <= 1}
        onClick={() => onChange(episodeNumber - 1)}
        aria-label="이전 회차"
      >
        <ChevronLeft size={16} />
      </Button>
      <Select value={String(episodeNumber)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}회차
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={episodeNumber >= max}
        onClick={() => onChange(episodeNumber + 1)}
        aria-label="다음 회차"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
