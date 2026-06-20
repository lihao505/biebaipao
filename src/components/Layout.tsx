import type { ReactNode } from 'react';
import Header from './Header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 page-enter">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-gray-400">
        别白跑 · TRAE AI 创造力大赛 · Mock Demo
      </footer>
    </div>
  );
}
