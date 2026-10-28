import React from 'react';
import { motion } from 'motion/react';
import { Waves, HeartHandshake, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../lib/audio';
import echoEtherealResonance from '../assets/images/echo_ethereal_resonance_1793214843115.jpg';
import echoHumanConnection from '../assets/images/echo_human_connection_1793214842450.jpg';

export const ConceptSection: React.FC = () => {
  return (
    <section id="the-concept" className="relative py-28 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-violet-400 mb-3">
              01. The Philosophy
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-xl text-balance">
              Words fade into memory. Echoes remain forever.
            </h2>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            In an era of fleeting feeds and temporary stories, ECHO creates a serene sanctuary
            to immortalize thoughts, grateful whispers, and artistic reflections.
          </p>
        </div>

        {/* 2-Column Visual & Conceptual Bento Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          {/* Card 1: Ethereal Resonance Artwork (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:border-violet-500/40 transition-colors"
          >
            <div className="mb-6 relative z-10">
              <div className="text-xs font-mono text-slate-400 mb-2">Art & Acoustic Geometry</div>
              <h3 className="font-display text-2xl font-semibold text-white">
                Harmonic Resonance
              </h3>
            </div>

            {/* Visual Container */}
            <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0c0c14] border border-white/10 group-hover:border-violet-400/30 transition-colors">
              <img
                src={echoEtherealResonance}
                alt="Ethereal concentric sound wave ripples and light frequencies"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-slate-400">Fig. 01 — Wave ripples in cosmic space</span>
                <span className="text-violet-300">528Hz Solfeggio</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-6 leading-relaxed relative z-10">
              Each submission radiates outward like ripples across an undisturbed pool. When you choose a mood,
              a unique harmonic frequency is etched into the collective soundscape.
            </p>
          </motion.div>

          {/* Card 2: Human Connection Sculpture (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:border-blue-500/40 transition-colors"
          >
            <div className="mb-6 relative z-10">
              <div className="text-xs font-mono text-slate-400 mb-2">Collective Human Presence</div>
              <h3 className="font-display text-2xl font-semibold text-white">
                Tapestry of Whispers
              </h3>
            </div>

            {/* Visual Container */}
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#0c0c14] border border-white/10 group-hover:border-blue-400/30 transition-colors">
              <img
                src={echoHumanConnection}
                alt="Minimalist sculpture of delicate illuminated glass ribbons floating in deep black space"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-slate-400">Fig. 02 — Connected consciousness</span>
                <span className="text-blue-300">Immutable</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-6 leading-relaxed relative z-10">
              Your voice joins strangers and dreamers from around the globe. Saved directly to a persistent
              PostgreSQL database, never erased, never lost.
            </p>
          </motion.div>
        </div>

        {/* 3 Core Tenets Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => soundEngine.playChime(528, 0.8)}
            className="glass-panel p-6 rounded-xl hover:border-violet-500/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold text-white mb-2">
              Emotional Resonance
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every echo is attuned to one of five moods: Happy, Inspired, Grateful, Curious, or Peaceful.
            </p>
          </div>

          <div
            onClick={() => soundEngine.playChime(432, 0.8)}
            className="glass-panel p-6 rounded-xl hover:border-violet-500/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold text-white mb-2">
              Supabase PostgreSQL
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real relational database backing with strict Row-Level Security ensuring messages are persisted safely.
            </p>
          </div>

          <div
            onClick={() => soundEngine.playChime(639, 0.8)}
            className="glass-panel p-6 rounded-xl hover:border-violet-500/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold text-white mb-2">
              Zero-Friction Access
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              No login wall, no passwords, no advertisements. Just genuine human expressions floating in quiet harmony.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
