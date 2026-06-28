import CompressTab from '@/components/CompressTab';
import WorkSelector from '@/components/shared/WorkSelector';
import { useNovelStore } from '@/stores/novelStore';
import type { RewriteMode, ScreenId } from '@/types/novel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SectionCard from '@/components/layout/SectionCard';
import { Search } from 'lucide-react';
import { checkConsistency } from '@/services/claudeService';
import { toast } from 'sonner';
import { useState } from 'react';

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

  const [styleWorkId, setStyleWorkId] = useState<string | null>(
    settings.defaultWorkByScreen.settings ?? works[0]?.id ?? null,
  );
  const [consistencyResult, setConsistencyResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const styleWork = works.find((w) => w.id === styleWorkId);

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
      <SectionCard title="Claude API" description="Anthropic API Key (브라우저에서 직접 호출)">
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

      <SectionCard title="문체 · 요구사항 (작품별)">
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
