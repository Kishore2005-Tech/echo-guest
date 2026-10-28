import React from 'react';
import { Database, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenDatabaseModal: () => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDatabaseModal,
  onScrollToTop,
}) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050508] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Concept */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-display text-base font-bold text-white tracking-tight">
            ECHO
          </span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <span>A public digital guestbook for thoughts and moments</span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenDatabaseModal}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-violet-400" />
            <span>Supabase & Netlify Guide</span>
          </button>

          <span className="text-slate-700">·</span>

          <button
            onClick={onScrollToTop}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3 h-3 text-violet-400" />
          </button>
        </div>

        {/* Quiet copyright */}
        <div className="text-slate-500 font-mono text-[11px] text-center sm:text-right">
          Crafted with care · PostgreSQL & Netlify Ready
        </div>
      </div>
    </footer>
  );
};
