import { useEffect, useState } from 'react';
import { Plus, Trash2, Users, Globe, GitBranch, List, Search } from 'lucide-react';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import WorkSelector from '@/components/shared/WorkSelector';
import EpisodeSelector from '@/components/shared/EpisodeSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { checkConsistency } from '@/services/claudeService';
import { toast } from 'sonner';

export default function WorksTab() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const createWork = useNovelStore((s) => s.createWork);
  const updateWork = useNovelStore((s) => s.updateWork);
  const deleteWork = useNovelStore((s) => s.deleteWork);
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
    <div className="flex flex-col gap-5 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-56">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">작품 목록</h2>
          <Button type="button" size="sm" variant="outline" onClick={handleCreate}>
            <Plus size={14} />
          </Button>
        </div>
        <ul className="space-y-1">
          {works.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => {
                  setWorkId(w.id);
                  setDefaultWorkForScreen('works', w.id);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  workId === w.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
              >
                {w.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        {!work ? (
          <p className="text-muted-foreground">작품을 선택하거나 새로 추가하세요.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <WorkSelector screen="works" value={workId} onChange={(id) => {
                setWorkId(id);
                setDefaultWorkForScreen('works', id);
              }} />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`"${work.title}"을(를) 삭제할까요?`)) {
                    deleteWork(work.id);
                    setWorkId(works.find((w) => w.id !== work.id)?.id ?? null);
                  }
                }}
              >
                <Trash2 size={14} className="mr-1" />
                삭제
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={handleConsistency} disabled={isChecking}>
                <Search size={14} className="mr-1" />
                {isChecking ? '검토 중…' : '일관성 검토'}
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={['basic', 'world', 'chars', 'plots']} className="space-y-2">
              <AccordionItem value="basic" className="rounded-xl border border-border bg-card px-4">
                <AccordionTrigger className="text-sm font-semibold">기본 정보</AccordionTrigger>
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

              <AccordionItem value="world" className="rounded-xl border border-border bg-card px-4">
                <AccordionTrigger className="text-sm font-semibold">
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chars" className="rounded-xl border border-border bg-card px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <Users size={16} className="mr-2" />
                  인물 설정 · 관계
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <ul className="space-y-2">
                    {work.characters.map((c) => (
                      <li key={c.id} className="rounded-lg border border-border p-3">
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
                    <Input placeholder="설명" value={newCharDesc} onChange={(e) => setNewCharDesc(e.target.value)} className="flex-1 min-w-[160px]" />
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
                    <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <GitBranch size={14} />
                      인물 관계
                    </p>
                    {work.relations.map((r, i) => {
                      const from = work.characters.find((c) => c.id === r.fromId)?.name ?? '?';
                      const to = work.characters.find((c) => c.id === r.toId)?.name ?? '?';
                      return (
                        <div key={i} className="mb-2 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                          <span>{from} → {to}: {r.relation}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeRelation(work.id, r.fromId, r.toId)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      );
                    })}
                    {work.characters.length >= 2 && (
                      <div className="flex flex-wrap gap-2">
                        <select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={relFrom} onChange={(e) => setRelFrom(e.target.value)}>
                          <option value="">From</option>
                          {work.characters.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={relTo} onChange={(e) => setRelTo(e.target.value)}>
                          <option value="">To</option>
                          {work.characters.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <Input placeholder="관계" value={relText} onChange={(e) => setRelText(e.target.value)} className="flex-1 min-w-[100px]" />
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plots" className="rounded-xl border border-border bg-card px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <List size={16} className="mr-2" />
                  회차별 플롯
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <EpisodeSelector work={work} episodeNumber={episodeNumber} onChange={setEpisodeNumber} />
                  <Textarea
                    rows={10}
                    value={work.episodes.find((e) => e.number === episodeNumber)?.plot ?? ''}
                    onChange={(e) => setEpisodeField(work.id, episodeNumber, 'plot', e.target.value)}
                    placeholder={`${episodeNumber}회차 플롯`}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {consistencyResult && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold">일관성 검토 결과</h3>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{consistencyResult}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
