import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md rounded-[var(--radius-xl)] border border-border bg-card p-8 text-center shadow-app-md">
        <p className="text-caption font-semibold text-primary">404</p>
        <h1 className="mt-2 text-display font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          요청하신 경로 <span className="font-mono text-foreground">{location.pathname}</span> 는 현재 프로토타입에 없습니다.
        </p>
        <Link
          to="/writing"
          className="mt-6 inline-flex rounded-[var(--radius-md)] bg-primary px-5 py-3 text-body font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
