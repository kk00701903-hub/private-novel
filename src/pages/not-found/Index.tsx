import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-slate-900 px-5 text-slate-100">
      {/* @section: not-found */}
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-[0_20px_60px_-35px_rgba(20,184,166,0.8)]">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          요청하신 경로 <span className="font-mono text-foreground">{location.pathname}</span> 는 현재 프로토타입에 없습니다.
        </p>
        <Link
          to="/writing"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
