import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { MdSaveResult } from '@/lib/mdSync';

interface SaveMdButtonProps {
  onSave: () => Promise<MdSaveResult>;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'default';
}

export default function SaveMdButton({
  onSave,
  disabled,
  label = 'MD 저장',
  size = 'sm',
}: SaveMdButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    setSaving(true);
    try {
      const result = await onSave();
      if (result.success) {
        toast.success(result.filename ? `${result.filename} 저장` : 'MD 저장 완료');
      } else {
        toast.error(result.message ?? '저장할 내용이 없습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={disabled || saving}
      onClick={() => void handleClick()}
    >
      {saving ? (
        <Loader2 size={14} className="mr-1.5 animate-spin" />
      ) : (
        <Download size={14} className="mr-1.5" />
      )}
      {label}
    </Button>
  );
}
