import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useNovelStore, resolveWorkId } from '@/stores/novelStore';
import BottomNav, { DesktopNav } from '@/components/shared/BottomNav';
import { initMdStorage } from '@/lib/localMdStorage';

export default function NovelAssistantApp() {
  const works = useNovelStore((s) => s.works);
  const settings = useNovelStore((s) => s.settings);
  const location = useLocation();

  useEffect(() => {
    void initMdStorage();
  }, []);

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
    <div className="app-viewport bg-background text-foreground">
      <div className="relative flex min-h-dvh flex-col pb-[var(--bottom-nav-h)] md:pb-0">
        <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card/90 shadow-app-sm backdrop-blur-sm">
          <div className="app-shell flex flex-col gap-3 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-8">
            <div>
              <h1 className="text-display font-bold tracking-tight">웹소설 AI 편집 어시스턴트</h1>
              <p className="mt-1 text-caption text-muted-foreground">
                {works.length > 0 ? `${works.length}개 작품 · 자동 저장` : '작품을 추가해 시작하세요'}
              </p>
            </div>
            {activeWork && (
              <div className="rounded-[var(--radius-md)] border border-border bg-muted/40 px-3 py-2 text-caption">
                <span className="text-muted-foreground">현재 작품 </span>
                <span className="font-semibold text-foreground">{activeWork.title}</span>
              </div>
            )}
          </div>
          <div className="app-shell px-4 pb-3 md:px-8">
            <DesktopNav />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="app-shell">
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
