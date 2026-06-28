import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { WandSparkles } from 'lucide-react';
import { useNovelStore } from '@/stores/novelStore';
import BottomNav, { DesktopNav } from '@/components/shared/BottomNav';

export default function NovelAssistantApp() {
  const works = useNovelStore((s) => s.works);
  const location = useLocation();

  const activeWork = works.find(
    (w) =>
      w.id ===
      (location.pathname.includes('/works')
        ? works[0]?.id
        : works[0]?.id),
  );

  return (
    <div className="dark min-h-screen bg-slate-900 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-20%] h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col pb-20 md:pb-0">
        <header className="shrink-0 border-b border-border bg-background/80 px-4 py-4 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
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
              <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
                <span className="text-muted-foreground">작품 </span>
                <span className="font-semibold text-card-foreground">{activeWork.title}</span>
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
