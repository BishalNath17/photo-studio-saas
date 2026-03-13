import React from 'react';
import { Outlet } from 'react-router-dom';
import { Camera, Github } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-saas-bg flex-col">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-saas-card border-b border-saas-border shrink-0 z-50">
        <div className="flex items-center gap-3 w-max">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saas-neon to-emerald-700 flex items-center justify-center shadow-lg shadow-saas-neon/20 shrink-0">
            <Camera className="text-white" size={20} />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-xl font-bebas text-white leading-none tracking-wide animate-fade-in-up text-glow-hover cursor-default">FaceSeek</h1>
            <p className="text-[11px] text-saas-muted font-medium mt-1 uppercase tracking-wider animate-fade-in-up-delay">Bishal DN</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/BishalNath17" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-saas-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <Github size={20} />
            <span className="text-sm font-medium hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-saas-bg relative w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
