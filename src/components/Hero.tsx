import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Sparkles, MessageCircle } from 'lucide-react';
import { InteractiveOrb } from './InteractiveOrb';

interface HeroProps {
  onLeaveEcho: () => void;
  onExploreMessages: () => void;
  messageCount?: number;
}

export const Hero: React.FC<HeroProps> = ({
  onLeaveEcho,
  onExploreMessages,
  messageCount = 0,
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 overflow-hidden">
      {/* Background Ambient Lighting & Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] rounded-full bg-blue-600/12 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Floating subtle grid pattern for editorial depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full py-12">
          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center z-10"
          >
            {/* Ambient editorial kicker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.2em] text-violet-300 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>A collective digital guestbook</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 tabular-nums">
                {messageCount > 0 ? `${messageCount} recorded echoes` : 'persisted in postgresql'}
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6 text-balance">
              Every thought <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-200 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                leaves an echo.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-xl mb-10 text-balance">
              A little space for your thoughts, stories, and moments. Leave
              something behind for travelers of the digital universe.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onLeaveEcho}
                className="group relative px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-violet-600 hover:bg-violet-500 shadow-xl shadow-violet-600/30 transition-all duration-300 hover:shadow-violet-500/50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <span>Leave Your Echo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreMessages}
                className="px-6 py-3.5 rounded-xl font-medium text-sm text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-violet-500/40 transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-violet-300" />
                <span>Explore Messages</span>
              </button>
            </div>

            {/* Micro editorial metadata row */}
            <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Real-Time</span>
                <span>·</span>
                <span>PostgreSQL Storage</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Privacy</span>
                <span>·</span>
                <span>No sign-up required</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Permanence</span>
                <span>·</span>
                <span>Persisted for all visitors</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Echo Orb Canvas (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center w-full"
          >
            <InteractiveOrb />
          </motion.div>
        </div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <div className="w-full flex justify-center items-center pt-4 z-10">
        <button
          onClick={onExploreMessages}
          aria-label="Scroll down to explore messages"
          className="flex flex-col items-center gap-2 text-xs font-mono text-slate-400 hover:text-violet-300 transition-colors cursor-pointer group"
        >
          <span className="tracking-widest uppercase text-[10px] opacity-75 group-hover:opacity-100">
            Scroll to discover
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-violet-400" />
          </motion.div>
        </button>
      </div>
    </section>
  );
};
