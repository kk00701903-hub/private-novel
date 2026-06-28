import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { WandSparkles } from 'lucide-react';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import BottomNav, { DesktopNav } from '@/components/shared/BottomNav';

export default function NovelAssistantApp() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const location = useLocation();

  const screen = location.pathname.split('/').pop() ?? 'writing';
  const activeWorkId = resolveWorkId(
    (['writing', 'works', 'archive', 'drafts', 'settings'].includes(screen)
      ? screen
      : 'writing') as 'writing' | 'works' | 'archive' | 'drafts' | 'settings',
    works,
    settings,
  );
  const activeWork = works.find((w) => w.id === activeWorkId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col pb-20 md:pb-0">
        <header className="shrink-0 border-b border-border/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-md md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <WandSparkles size={13} />
                Claude · Zustand · localStorage
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                웹소설 AI 편집 어시스턴트
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {works.length > 0 ? `${works.length}개 작품 · 데이터 자동 저장` : '작품을 추가해 시작하세요'}
              </p>
            </div>
            {activeWork && (
              <div className="rounded-xl border border-border bg-white px-3 py-2 text-xs shadow-sm">
                <span className="text-muted-foreground">작품 </span>
                <span className="font-semibold text-foreground">{activeWork.title}</span>
              </div>
            )}
          </div>
          <div className="mx-auto mt-4 max-w-7xl">
            <DesktopNav />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

export function AppIndexRedirect() {
  return <Navigate to="/writing" replace />;
}
