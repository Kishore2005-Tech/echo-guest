import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Database, Menu, X } from 'lucide-react';
import { soundEngine } from '../lib/audio';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  onOpenDatabaseModal: () => void;
  messageCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDatabaseModal, messageCount }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    setConfigured(isSupabaseConfigured());
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07070A]/85 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/40'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
          <span>ECHO</span>
          <span className="text-xs font-mono font-normal text-slate-400 hidden sm:inline ml-1">
            · digital guestbook
          </span>
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollTo('the-concept')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            The Concept
          </button>
          <button
            onClick={() => scrollTo('leave-echo')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Leave an Echo
          </button>
          <button
            onClick={() => scrollTo('message-wall')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Message Wall</span>
            {typeof messageCount === 'number' && messageCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-violet-300 px-1.5 py-0.2 rounded bg-violet-500/20">
                {messageCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenDatabaseModal}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-slate-300"
          >
            <Database className="w-3.5 h-3.5 text-violet-400" />
            <span>Database Setup</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button & audio utility */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Synthesizer toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
            title={isMuted ? 'Sound muted — click to unmute' : 'Sound active — click to mute'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-violet-400 animate-pulse" />
            )}
          </button>

          {/* Database indicator badge button */}
          <button
            onClick={onOpenDatabaseModal}
            title={configured ? 'Supabase connected' : 'Supabase setup required'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-white/[0.08] hover:border-violet-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                configured ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
            />
            <span>{configured ? 'Supabase' : 'Setup DB'}</span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => scrollTo('leave-echo')}
            className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-lg shadow-violet-600/25 transition-all duration-200 hover:shadow-violet-600/40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Leave Your Echo
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#07070A]/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
          <button
            onClick={() => scrollTo('the-concept')}
            className="text-left text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            The Concept
          </button>
          <button
            onClick={() => scrollTo('leave-echo')}
            className="text-left text-sm font-medium text-slate-300 hover:text-white py-1.5"
          >
            Leave an Echo
          </button>
          <button
            onClick={() => scrollTo('message-wall')}
            className="text-left text-sm font-medium text-slate-300 hover:text-white py-1.5 flex items-center justify-between"
          >
            <span>Message Wall</span>
            {typeof messageCount === 'number' && messageCount > 0 && (
              <span className="text-xs font-mono tabular-nums text-violet-300 px-2 py-0.5 rounded bg-violet-500/20">
                {messageCount} echoes
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDatabaseModal();
            }}
            className="text-left text-sm font-medium text-violet-300 hover:text-violet-200 py-1.5 flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-violet-400" />
            <span>Supabase & Netlify Guide</span>
          </button>
        </div>
      )}
    </header>
  );
};
