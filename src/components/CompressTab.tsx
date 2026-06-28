import { useCallback, useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Download, Image as ImageIcon, ImageDown, Loader2, Upload } from 'lucide-react';
import SectionCard from '@/components/layout/SectionCard';
import { cn } from '@/lib/utils';

interface ImageInfo {
  file: File;
  url: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressTab() {
  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<ImageInfo | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (original?.url) URL.revokeObjectURL(original.url);
      if (compressed?.url) URL.revokeObjectURL(compressed.url);
    };
  }, [compressed?.url, original?.url]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setError('');
    setCompressed(null);
    setOriginal({ file, url: URL.createObjectURL(file), size: file.size });
    setIsCompressing(true);

    try {
      const result = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      setCompressed({ file: result, url: URL.createObjectURL(result), size: result.size });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '압축 중 오류가 발생했습니다.');
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = '';
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  const handleDownload = () => {
    if (!compressed) return;
    const anchor = document.createElement('a');
    anchor.href = compressed.url;
    const base = compressed.file.name.replace(/\.[^.]+$/, '');
    const ext = compressed.file.name.split('.').pop() ?? 'jpg';
    anchor.download = `${base}_compressed.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const reductionRate =
    original && compressed ? Math.max(0, Math.round((1 - compressed.size / original.size) * 100)) : 0;

  return (
    <div className="page-stack w-full max-w-5xl">
      <SectionCard
        title="표지/삽화 압축"
        description="웹소설 플랫폼 업로드용 이미지를 1MB 이하로 자동 압축합니다. 모든 처리는 브라우저 안에서 수행됩니다."
      />

      <div
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed p-10 text-center transition-all duration-200',
          isDragOver
            ? 'border-primary bg-primary/5 shadow-app-md'
            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
        )}
      >
        <div className="rounded-[var(--radius)] bg-secondary p-4">
          <Upload size={34} className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
        </div>
        <p className="text-body text-muted-foreground">
          이미지를 여기에 드래그하거나 <span className="font-semibold text-primary">클릭하여 선택</span>
        </p>
        <p className="text-caption text-muted-foreground">JPG, PNG, WebP, GIF 등 이미지 형식 지원 · maxSizeMB: 1</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {isCompressing && (
        <SectionCard variant="flat" bodyClassName="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-body text-foreground">이미지 압축 중...</span>
        </SectionCard>
      )}

      {error && (
        <p className="rounded-[var(--radius)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-body text-destructive">
          {error}
        </p>
      )}

      {original && compressed && !isCompressing && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard variant="flat" noPadding bodyClassName="p-0">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <ImageIcon size={15} className="text-muted-foreground" />
              <span className="text-body font-semibold">원본 이미지</span>
              <span className="ml-auto rounded-full bg-warning/15 px-2.5 py-1 font-mono text-caption text-warning">
                {formatSize(original.size)}
              </span>
            </div>
            <div className="p-3">
              <img src={original.url} alt="원본" className="h-60 w-full rounded-[var(--radius-md)] bg-background object-contain" />
              <p className="mt-3 truncate text-caption text-muted-foreground">{original.file.name}</p>
            </div>
          </SectionCard>

          <SectionCard variant="flat" noPadding bodyClassName="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <ImageDown size={15} className="text-success" />
              <span className="text-body font-semibold">압축 결과</span>
              <span className="ml-auto rounded-full bg-success/10 px-2.5 py-1 font-mono text-caption text-success">
                {formatSize(compressed.size)}
              </span>
              <span className="rounded-full border border-success/20 bg-success/5 px-2 py-1 text-caption text-success">
                {reductionRate}% 감소
              </span>
            </div>
            <div className="p-3">
              <img src={compressed.url} alt="압축본" className="h-60 w-full rounded-[var(--radius-md)] bg-background object-contain" />
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-3 text-body font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                <Download size={16} />
                다운로드
              </button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
