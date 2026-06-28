import { useState } from 'react';
import { FileText, ImageDown, WandSparkles } from 'lucide-react';
import WritingTab from './components/WritingTab';
import CompressTab from './components/CompressTab';

type Tab = 'writing' | 'compress';

const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'writing', label: 'AI 원고 집필', icon: <FileText size={16} />, description: '세계관과 플롯 기반 윤문' },
  { id: 'compress', label: '표지/삽화 압축', icon: <ImageDown size={16} />, description: '1MB 이하 이미지 최적화' },
];

export default function NovelAssistantApp() {
  const [activeTab, setActiveTab] = useState<Tab>('writing');

  return (
    <div className="dark min-h-screen bg-slate-900 text-slate-100">
      {/* @section: app-shell */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-20%] h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* @section: header */}
        <header className="shrink-0 border-b border-border bg-background/80 px-5 py-5 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <WandSparkles size={13} />
                Vite · React 18 · TypeScript · Tailwind CSS
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">✍️ 웹소설 AI 편집 어시스턴트</h1>
              <p className="mt-1 text-sm text-muted-foreground">AI 원고 윤문 · 표지/삽화 압축 도구 프로토타입</p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
              <p className="font-semibold text-card-foreground">클라이언트 전용 프로토타입</p>
              <p>컨텍스트 데이터는 src/data 상수 모듈에서 관리됩니다.</p>
            </div>
          </div>
        </header>

        {/* @section: tabs */}
        <nav className="shrink-0 px-5 pt-5 md:px-8" aria-label="기능 탭">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2">
            {tabs.map(({ id, label, icon, description }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                  activeTab === id
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_18px_36px_-24px_rgba(20,184,166,0.9)]'
                    : 'border-border bg-card text-card-foreground hover:border-primary/60 hover:bg-secondary'
                }`}
              >
                <span
                  className={`rounded-xl p-2 transition-colors ${
                    activeTab === id ? 'bg-primary-foreground/15' : 'bg-secondary text-primary group-hover:bg-background'
                  }`}
                >
                  {icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={activeTab === id ? 'text-xs text-primary-foreground/75' : 'text-xs text-muted-foreground'}>
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* @section: main-content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 md:px-8">
          <div className="mx-auto h-full max-w-7xl">{activeTab === 'writing' ? <WritingTab /> : <CompressTab />}</div>
        </main>
      </div>
    </div>
  );
}
