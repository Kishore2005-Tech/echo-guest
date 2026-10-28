import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { EchoMessage } from '../types/echo';
import { MOODS } from '../lib/constants';
import { soundEngine } from '../lib/audio';

interface MessageCardProps {
  echo: EchoMessage;
  index: number;
}

export const MessageCard: React.FC<MessageCardProps> = ({ echo, index }) => {
  const moodMeta = MOODS[echo.mood] || MOODS.Inspired;

  // Format date cleanly
  const formattedDate = (() => {
    try {
      const d = new Date(echo.created_at);
      if (isNaN(d.getTime())) return 'Recently';

      // If today, show relative or time
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  const handleCardClick = () => {
    soundEngine.playChime(moodMeta.frequency, 0.6);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={handleCardClick}
      className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative group cursor-pointer overflow-hidden"
    >
      {/* Mood ambient rim glow on hover */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: moodMeta.color }}
      />

      {/* Quote Icon watermark */}
      <div className="absolute top-5 right-5 text-white/[0.04] group-hover:text-white/[0.08] transition-colors pointer-events-none">
        <Quote className="w-8 h-8" />
      </div>

      {/* Body: Message text */}
      <div className="mb-6 relative z-10">
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap break-words">
          "{echo.message}"
        </p>
      </div>

      {/* Footer: Zero-pill clean unboxed metadata with separators */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-medium text-slate-200 truncate">
            {echo.name}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <time dateTime={echo.created_at} className="font-mono text-slate-400 shrink-0 tabular-nums">
            {formattedDate}
          </time>
        </div>

        {/* Clean Mood Indicator with small colored dot and unboxed text */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: moodMeta.color }}
          />
          <span className={`font-medium ${moodMeta.textColor}`}>
            {echo.mood}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
