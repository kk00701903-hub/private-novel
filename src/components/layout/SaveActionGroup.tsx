import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SaveMdButton from '@/components/layout/SaveMdButton';
import type { MdSaveResult } from '@/lib/mdSync';

interface SaveActionGroupProps {
  onSave: () => void;
  onSaveMd: () => Promise<MdSaveResult>;
  saveLabel?: string;
  mdLabel?: string;
  disabled?: boolean;
  saveDisabled?: boolean;
  saving?: boolean;
}

export default function SaveActionGroup({
  onSave,
  onSaveMd,
  saveLabel = '본문 저장',
  mdLabel,
  disabled,
  saveDisabled,
  saving = false,
}: SaveActionGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={saveDisabled ?? disabled ?? saving}
        onClick={onSave}
      >
        {saving ? (
          <Loader2 size={14} className="mr-1.5 animate-spin" />
        ) : (
          <Save size={14} className="mr-1.5" />
        )}
        {saveLabel}
      </Button>
      <SaveMdButton onSave={onSaveMd} disabled={disabled} label={mdLabel} />
    </div>
  );
}
