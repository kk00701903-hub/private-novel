import { NavLink } from 'react-router-dom';
import { Archive, BookOpen, FileEdit, PenLine, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/writing', label: 'AI 집필', icon: PenLine },
  { to: '/works', label: '작품', icon: BookOpen },
  { to: '/archive', label: '저장', icon: Archive },
  { to: '/drafts', label: '초안', icon: FileEdit },
  { to: '/settings', label: '설정', icon: Settings },
] as const;

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 shadow-app-md backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="하단 탭"
    >
      <div className="mx-auto flex w-full max-w-[var(--app-max-w)] items-stretch justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" aria-hidden />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  return (
    <nav
      className="hidden gap-1 rounded-[var(--radius)] bg-muted/60 p-1 md:inline-flex"
      aria-label="상단 탭"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-body font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-app-sm'
                : 'text-muted-foreground hover:bg-card hover:text-foreground',
            )
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
