import CompressTab from '@/components/CompressTab';
import WorkSelector from '@/components/shared/WorkSelector';
import { useNovelStore } from '@/stores/novelStore';
import type { RewriteMode, ScreenId } from '@/types/novel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/layout/SectionCard';
import SaveActionGroup from '@/components/layout/SaveActionGroup';
import { Search, FolderOpen, Download, FolderX, Trash2 } from 'lucide-react';
import { checkConsistency } from '@/services/claudeService';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
  clearMdSaveFolder,
  getMdSaveFolderName,
  initMdStorage,
  pickMdSaveFolder,
  supportsMdFolderPicker,
} from '@/lib/localMdStorage';
import { exportAllWorksMd, saveStyleMd } from '@/lib/mdSync';
import { isLocalDev } from '@/lib/isLocalDev';

const SCREEN_LABELS: Record<ScreenId, string> = {
  writing: 'AI 집필',
  works: '작품 관리',
  archive: '결과 저장',
  drafts: '초안 입력',
  settings: '설정',
};

export default function SettingsTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const updateSettings = useNovelStore((s) => s.updateSettings);
  const setRewriteMode = useNovelStore((s) => s.setRewriteMode);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);
  const updateWork = useNovelStore((s) => s.updateWork);
  const deleteWork = useNovelStore((s) => s.deleteWork);

  const [styleWorkId, setStyleWorkId] = useState<string | null>(
    settings.defaultWorkByScreen.settings ?? works[0]?.id ?? null,
  );
  const [deleteWorkId, setDeleteWorkId] = useState<string | null>(
    settings.defaultWorkByScreen.settings ?? works[0]?.id ?? null,
  );
  const [consistencyResult, setConsistencyResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [mdFolder, setMdFolder] = useState<string | null>(null);
  const [isExportingMd, setIsExportingMd] = useState(false);

  const styleWork = works.find((w) => w.id === styleWorkId);
  const workToDelete = works.find((w) => w.id === deleteWorkId);

  const handleDeleteWork = () => {
    if (!workToDelete) return;
    if (!confirm(`"${workToDelete.title}"을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    deleteWork(workToDelete.id);
    const remaining = works.filter((w) => w.id !== workToDelete.id);
    const nextId = remaining[0]?.id ?? null;
    setDeleteWorkId(nextId);
    if (styleWorkId === workToDelete.id) setStyleWorkId(nextId);
    toast.success(`"${workToDelete.title}" 작품이 삭제되었습니다.`);
  };

  useEffect(() => {
    void initMdStorage().then(() => setMdFolder(getMdSaveFolderName()));
  }, []);

  const handlePickMdFolder = async () => {
    const name = await pickMdSaveFolder();
    if (name) {
      setMdFolder(name);
      toast.success(`MD 저장 폴더: ${name}`);
    }
  };

  const handleClearMdFolder = async () => {
    await clearMdSaveFolder();
    setMdFolder(null);
    toast.success('MD 저장 폴더 연결을 해제했습니다. 이후에는 다운로드로 저장됩니다.');
  };

  const handleExportAllMd = async () => {
    if (works.length === 0) {
      toast.error('내보낼 작품이 없습니다.');
      return;
    }
    setIsExportingMd(true);
    try {
      const count = await exportAllWorksMd(works);
      toast.success(`${count}개 MD 파일로 저장했습니다.`);
    } finally {
      setIsExportingMd(false);
    }
  };

  const handleConsistencyAll = async () => {
    if (works.length === 0) return;
    setIsChecking(true);
    const results: string[] = [];
    try {
      for (const work of works) {
        const r = await checkConsistency(work, settings.claudeApiKey, settings.claudeModel);
        results.push(`## ${work.title}\n${r}`);
      }
      setConsistencyResult(results.join('\n\n---\n\n'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '검토 오류');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="page-stack mx-auto max-w-3xl">
      <SectionCard
        title="MD 로컬 저장"
        description="각 항목의 MD 저장 버튼을 눌러 파일로 저장합니다. 폴더를 연결하면 다운로드 없이 저장됩니다."
      >
        <div className="flex flex-wrap gap-2">
          {supportsMdFolderPicker() && (
            <Button type="button" variant="outline" size="sm" onClick={() => void handlePickMdFolder()}>
              <FolderOpen size={14} className="mr-1.5" />
              저장 폴더 선택
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => void handleExportAllMd()} disabled={isExportingMd || works.length === 0}>
            <Download size={14} className="mr-1.5" />
            {isExportingMd ? '내보내는 중…' : '전체 MD 내보내기'}
          </Button>
          {mdFolder && (
            <Button type="button" variant="ghost" size="sm" onClick={() => void handleClearMdFolder()}>
              <FolderX size={14} className="mr-1.5" />
              폴더 연결 해제
            </Button>
          )}
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          {mdFolder
            ? `연결된 폴더: ${mdFolder} — 같은 파일명으로 덮어씁니다.`
            : supportsMdFolderPicker()
              ? '폴더를 선택하면 다운로드 없이 바로 저장됩니다. 미선택 시 브라우저 다운로드로 저장됩니다.'
              : '이 브라우저는 폴더 선택을 지원하지 않습니다. MD 파일이 다운로드 폴더에 저장됩니다.'}
        </p>
      </SectionCard>

      <SectionCard
        title="Claude API"
        description={
          isLocalDev
            ? '로컬 개발 환경에서만 API Key를 입력할 수 있습니다.'
            : 'API Key는 보안상 로컬 개발(npm run dev)에서만 설정할 수 있습니다.'
        }
      >
        {isLocalDev ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                className="mt-1 font-mono text-caption"
                value={settings.claudeApiKey}
                onChange={(e) => updateSettings({ claudeApiKey: e.target.value })}
                placeholder="sk-ant-..."
              />
              <p className="mt-1 text-caption text-muted-foreground">
                `.env`의 `VITE_ANTHROPIC_API_KEY` 또는 여기에 직접 입력하세요.
              </p>
            </div>
            <div>
              <Label htmlFor="model">모델</Label>
              <Input
                id="model"
                className="mt-1 font-mono text-caption"
                value={settings.claudeModel}
                onChange={(e) => updateSettings({ claudeModel: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <p className="text-body text-muted-foreground">
            GitHub Pages 등 배포 환경에서는 API Key 입력이 비활성화되어 있습니다.
            <br />
            AI 집필을 사용하려면 프로젝트 폴더에서{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-caption">npm run dev</code>
            로 로컬 서버를 실행한 뒤 설정 탭에서 키를 입력하세요.
          </p>
        )}
      </SectionCard>

      <SectionCard title="작품 삭제" description="작품과 모든 회차 데이터를 영구 삭제합니다.">
        <WorkSelector screen="settings" value={deleteWorkId} onChange={setDeleteWorkId} />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="mt-4"
          disabled={!workToDelete}
          onClick={handleDeleteWork}
        >
          <Trash2 size={14} className="mr-1.5" />
          {workToDelete ? `"${workToDelete.title}" 삭제` : '삭제할 작품 선택'}
        </Button>
      </SectionCard>

      <SectionCard title="집필 모드">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={settings.rewriteMode === 'draft' ? 'default' : 'outline'}
            onClick={() => setRewriteMode('draft' as RewriteMode)}
          >
            초안 + 각색 방향
          </Button>
          <Button
            type="button"
            variant={settings.rewriteMode === 'plot' ? 'default' : 'outline'}
            onClick={() => setRewriteMode('plot' as RewriteMode)}
          >
            플롯 + 이전 회차
          </Button>
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          초안 모드: 초안과 각색 방향을 보고 재작성 · 플롯 모드: 이전 회차와 플롯을 보고 집필
        </p>
      </SectionCard>

      <SectionCard title="화면별 기본 작품">
        <div className="space-y-3">
          {(Object.keys(SCREEN_LABELS) as ScreenId[]).map((screen) => (
            <div key={screen} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-body text-muted-foreground">{SCREEN_LABELS[screen]}</span>
              <WorkSelector
                screen={screen}
                value={settings.defaultWorkByScreen[screen]}
                onChange={(id) => setDefaultWorkForScreen(screen, id)}
                className="max-w-xs flex-1"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="문체 · 요구사항 (작품별)"
        action={
          styleWork ? (
            <SaveActionGroup
              onSave={() => toast.success('문체 설정이 저장되었습니다.')}
              onSaveMd={() => saveStyleMd(styleWork)}
            />
          ) : undefined
        }
      >
        <WorkSelector screen="settings" value={styleWorkId} onChange={setStyleWorkId} />
        {styleWork && (
          <div className="mt-4 space-y-3">
            <div>
              <Label>문체 예시 (띄어쓰기, 문단 등)</Label>
              <Textarea
                rows={5}
                className="mt-1"
                value={styleWork.styleGuide}
                onChange={(e) => updateWork(styleWork.id, { styleGuide: e.target.value })}
              />
            </div>
            <div>
              <Label>구체적 요구사항</Label>
              <Textarea
                rows={4}
                className="mt-1"
                value={styleWork.styleRequirements}
                onChange={(e) => updateWork(styleWork.id, { styleRequirements: e.target.value })}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="전체 일관성 검토" description="모든 작품의 설정·회차를 검토합니다.">
        <Button type="button" variant="secondary" onClick={handleConsistencyAll} disabled={isChecking}>
          <Search size={14} className="mr-2" />
          {isChecking ? '검토 중…' : '전체 검토 실행'}
        </Button>
        {consistencyResult && (
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-muted/40 p-3 font-mono text-caption">
            {consistencyResult}
          </pre>
        )}
      </SectionCard>

      <CompressTab />
    </div>
  );
}
