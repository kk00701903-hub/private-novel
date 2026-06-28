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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      aria-label="하단 탭"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon size={20} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  return (
    <nav className="hidden flex-wrap gap-2 md:flex" aria-label="상단 탭">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_12px_28px_-18px_rgba(20,184,166,0.9)]'
                : 'border-border bg-white text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5',
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
