import { useState } from 'react';
import { Check, Copy, FileText, Key, Loader2, Sparkles } from 'lucide-react';
import { refineNovel } from '../services/openaiService';

export default function WritingTab() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY ?? '');
  const [episodeNumber, setEpisodeNumber] = useState(2);
  const [draft, setDraft] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRefine = async () => {
    if (!draft.trim()) return;
    setIsRefining(true);
    setError('');
    setRefinedText('');

    try {
      const result = await refineNovel(draft, episodeNumber, apiKey);
      setRefinedText(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '요청 중 오류가 발생했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    if (!refinedText) return;
    await navigator.clipboard.writeText(refinedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col gap-5">
      {/* @section: writing-toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_18px_45px_-28px_rgba(20,184,166,0.45)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <Key size={15} className="shrink-0 text-muted-foreground" />
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="OpenAI API Key (sk-...)"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <label htmlFor="episode-number" className="whitespace-nowrap text-sm text-muted-foreground">
              현재 작업 회차
            </label>
            <input
              id="episode-number"
              type="number"
              min={1}
              value={episodeNumber}
              onChange={(event) => setEpisodeNumber(Number(event.target.value))}
              className="w-20 bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none"
            />
            <span className="text-sm text-muted-foreground">회차</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          API 키가 없으면 Mock 응답으로 동작합니다. 프로토타입 특성상 브라우저에서 직접 OpenAI SDK를 호출합니다.
        </p>
      </div>

      {/* @section: writing-split-screen */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="flex min-h-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_18px_45px_-32px_rgba(20,184,166,0.38)]">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <FileText size={16} className="text-primary" />
              초안 작성
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{draft.length}자</span>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`${episodeNumber}회차 초안을 여기에 입력하세요...\n\n예시: 이든은 어둠 속 도서관 문을 밀었다. 먼지 쌓인 책들 사이, 금빛 글자가 새겨진 낡은 책이 눈에 띄었다.`}
            className="min-h-[360px] flex-1 resize-none rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={isRefining || !draft.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-14px_rgba(20,184,166,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {isRefining ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AI 윤문 중...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                AI 맞춤 수정
              </>
            )}
          </button>
        </section>

        <section className="flex min-h-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_18px_45px_-32px_rgba(20,184,166,0.38)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Sparkles size={16} className="text-primary" />
              AI 윤문 결과
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!refinedText}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? '복사됨' : '결과 복사'}
            </button>
          </div>
          <div className="min-h-[360px] flex-1 overflow-y-auto rounded-2xl border border-border bg-background p-4">
            {error ? (
              <p className="text-sm leading-7 text-destructive">{error}</p>
            ) : isRefining ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={17} className="animate-spin text-primary" />
                <span>gpt-4o가 세계관과 문체를 분석 중입니다...</span>
              </div>
            ) : refinedText ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{refinedText}</p>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                왼쪽에 초안을 입력하고 [AI 맞춤 수정]을 누르면 여기에 윤문 결과가 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
