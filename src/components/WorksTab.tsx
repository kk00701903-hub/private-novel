import { useEffect, useState } from 'react';
import { Plus, Trash2, Users, Globe, GitBranch, List, Search } from 'lucide-react';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SectionCard from '@/components/layout/SectionCard';
import PageToolbar from '@/components/layout/PageToolbar';
import SaveActionGroup from '@/components/layout/SaveActionGroup';
import { saveCharactersMd, saveEpisodePlotMd, saveWorldviewMd } from '@/lib/mdSync';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function WorksTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const createWork = useNovelStore((s) => s.createWork);
  const updateWork = useNovelStore((s) => s.updateWork);
  const setTotalEpisodes = useNovelStore((s) => s.setTotalEpisodes);
  const setEpisodeField = useNovelStore((s) => s.setEpisodeField);
  const addCharacter = useNovelStore((s) => s.addCharacter);
  const removeCharacter = useNovelStore((s) => s.removeCharacter);
  const addRelation = useNovelStore((s) => s.addRelation);
  const removeRelation = useNovelStore((s) => s.removeRelation);
  const setDefaultWorkForScreen = useNovelStore((s) => s.setDefaultWorkForScreen);

  const [workId, setWorkId] = useState<string | null>(() =>
    resolveWorkId('works', works, settings),
  );
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');
  const [relFrom, setRelFrom] = useState('');
  const [relTo, setRelTo] = useState('');
  const [relText, setRelText] = useState('');
  const [consistencyResult, setConsistencyResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const work = works.find((w) => w.id === workId);

  useEffect(() => {
    if (!workId && works.length > 0) {
      setWorkId(resolveWorkId('works', works, settings));
    }
  }, [workId, works, settings]);

  const handleCreate = () => {
    const id = createWork();
    setWorkId(id);
    setDefaultWorkForScreen('works', id);
    toast.success('새 작품이 추가되었습니다.');
  };

  const handleConsistency = async () => {
    if (!work) return;
    setIsChecking(true);
    try {
      const result = await checkConsistency(work, settings.claudeApiKey, settings.claudeModel);
      setConsistencyResult(result);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '검토 중 오류');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="page-stack mx-auto max-w-3xl">
      <SectionCard
        title="작품 목록"
        noPadding
        action={
          <Button type="button" size="sm" variant="outline" onClick={handleCreate} aria-label="새 작품">
            <Plus size={14} />
          </Button>
        }
      >
        {works.length === 0 ? (
          <p className="px-4 py-6 text-body text-muted-foreground">작품을 추가해 시작하세요.</p>
        ) : (
          <ul className="divide-y divide-border">
            {works.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => {
                    setWorkId(w.id);
                    setDefaultWorkForScreen('works', w.id);
                  }}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors',
                    workId === w.id ? 'bg-primary/8' : 'hover:bg-muted/60',
                  )}
                >
                  <span
                    className={cn(
                      'text-body font-semibold',
                      workId === w.id ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {w.title}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {w.totalEpisodes}회차 · {w.episodes.filter((e) => e.finalText.trim()).length}회 저장됨
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {!work ? (
        works.length > 0 && (
          <p className="text-body text-muted-foreground">목록에서 작품을 선택하세요.</p>
        )
      ) : (
        <>
          <SectionCard noPadding bodyClassName="p-4 sm:p-5">
            <PageToolbar>
              <span className="text-title font-semibold">{work.title}</span>
              <Button type="button" size="sm" variant="secondary" onClick={handleConsistency} disabled={isChecking}>
                <Search size={14} className="mr-1" />
                {isChecking ? '검토 중…' : '일관성 검토'}
              </Button>
            </PageToolbar>
          </SectionCard>

            <Accordion type="multiple" defaultValue={['basic', 'world', 'chars', 'plots']} className="space-y-3">
              <AccordionItem value="basic" className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-app-sm px-4">
                <AccordionTrigger className="text-title font-semibold">기본 정보</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label>작품 제목</Label>
                    <Input
                      value={work.title}
                      onChange={(e) => updateWork(work.id, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>최종 회차 수</Label>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={work.totalEpisodes}
                      onChange={(e) => setTotalEpisodes(work.id, Number(e.target.value))}
                      className="mt-1 w-32"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="world" className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-app-sm px-4">
                <AccordionTrigger className="text-title font-semibold">
                  <Globe size={16} className="mr-2" />
                  세계관
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Textarea
                    rows={8}
                    value={work.worldview}
                    onChange={(e) => updateWork(work.id, { worldview: e.target.value })}
                    placeholder="세계관, 배경, 규칙 등"
                  />
                  <div className="mt-3">
                    <SaveActionGroup
                      onSave={() => toast.success('세계관이 저장되었습니다.')}
                      onSaveMd={() => saveWorldviewMd(work)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chars" className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-app-sm px-4">
                <AccordionTrigger className="text-title font-semibold">
                  <Users size={16} className="mr-2" />
                  인물 설정 · 관계
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <ul className="space-y-2">
                    {work.characters.map((c) => (
                      <li key={c.id} className="rounded-[var(--radius-md)] border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <Input
                            value={c.name}
                            onChange={(e) =>
                              useNovelStore.getState().updateCharacter(work.id, c.id, { name: e.target.value })
                            }
                            className="max-w-[140px] font-semibold"
                          />
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCharacter(work.id, c.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <Textarea
                          rows={2}
                          className="mt-2"
                          value={c.description}
                          onChange={(e) =>
                            useNovelStore.getState().updateCharacter(work.id, c.id, { description: e.target.value })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Input placeholder="이름" value={newCharName} onChange={(e) => setNewCharName(e.target.value)} className="max-w-[120px]" />
                    <Input placeholder="설명" value={newCharDesc} onChange={(e) => setNewCharDesc(e.target.value)} className="min-w-[160px] flex-1" />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (!newCharName.trim()) return;
                        addCharacter(work.id, { name: newCharName, description: newCharDesc });
                        setNewCharName('');
                        setNewCharDesc('');
                      }}
                    >
                      인물 추가
                    </Button>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="mb-2 flex items-center gap-1 text-caption font-medium text-muted-foreground">
                      <GitBranch size={14} />
                      인물 관계
                    </p>
                    {work.relations.map((r, i) => {
                      const from = work.characters.find((c) => c.id === r.fromId)?.name ?? '?';
                      const to = work.characters.find((c) => c.id === r.toId)?.name ?? '?';
                      return (
                        <div key={i} className="mb-2 flex items-center justify-between rounded-[var(--radius-md)] bg-muted/50 px-3 py-2 text-body">
                          <span>{from} → {to}: {r.relation}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeRelation(work.id, r.fromId, r.toId)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      );
                    })}
                    {work.characters.length >= 2 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Select value={relFrom || undefined} onValueChange={setRelFrom}>
                          <SelectTrigger size="sm" className="w-[120px]">
                            <SelectValue placeholder="From" />
                          </SelectTrigger>
                          <SelectContent>
                            {work.characters.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={relTo || undefined} onValueChange={setRelTo}>
                          <SelectTrigger size="sm" className="w-[120px]">
                            <SelectValue placeholder="To" />
                          </SelectTrigger>
                          <SelectContent>
                            {work.characters.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="관계" value={relText} onChange={(e) => setRelText(e.target.value)} className="min-w-[100px] flex-1" />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (!relFrom || !relTo || !relText.trim()) return;
                            addRelation(work.id, { fromId: relFrom, toId: relTo, relation: relText });
                            setRelText('');
                          }}
                        >
                          추가
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <SaveActionGroup
                      onSave={() => toast.success('인물 설정이 저장되었습니다.')}
                      onSaveMd={() => saveCharactersMd(work)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plots" className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-app-sm px-4">
                <AccordionTrigger className="text-title font-semibold">
                  <List size={16} className="mr-2" />
                  회차별 플롯
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
                  <div>
                    <Label>회차 제목</Label>
                    <Input
                      className="mt-1"
                      value={work.episodes.find((e) => e.number === episodeNumber)?.title ?? ''}
                      onChange={(e) => setEpisodeField(work.id, episodeNumber, 'title', e.target.value)}
                      placeholder={`${episodeNumber}회차 제목 (AI 집필 목록에 표시)`}
                    />
                  </div>
                  <div>
                    <Label>플롯</Label>
                    <Textarea
                      rows={10}
                      className="mt-1"
                      value={work.episodes.find((e) => e.number === episodeNumber)?.plot ?? ''}
                      onChange={(e) => setEpisodeField(work.id, episodeNumber, 'plot', e.target.value)}
                      placeholder={`${episodeNumber}회차 플롯`}
                    />
                  </div>
                  <SaveActionGroup
                    onSave={() => toast.success(`${episodeNumber}회차 플롯이 저장되었습니다.`)}
                    onSaveMd={() => saveEpisodePlotMd(work, episodeNumber)}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {consistencyResult && (
              <SectionCard title="일관성 검토 결과">
                <pre className="whitespace-pre-wrap text-body text-muted-foreground">{consistencyResult}</pre>
              </SectionCard>
            )}
          </>
        )}
    </div>
  );
}
