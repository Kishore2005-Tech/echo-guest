import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, AlertCircle, Sparkles, Loader2, Database } from 'lucide-react';
import { MoodType, EchoMessage } from '../types/echo';
import { MOODS } from '../lib/constants';
import { insertMessage, isSupabaseConfigured } from '../lib/supabase';
import { soundEngine } from '../lib/audio';

interface MessageFormProps {
  onMessageSubmitted: (newEcho: EchoMessage) => void;
  onOpenDatabaseModal: () => void;
}

export const MessageForm: React.FC<MessageFormProps> = ({
  onMessageSubmitted,
  onOpenDatabaseModal,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('Inspired');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<EchoMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const moodList: MoodType[] = ['Happy', 'Inspired', 'Grateful', 'Curious', 'Peaceful'];
  const activeMoodMeta = MOODS[selectedMood];

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    soundEngine.playChime(MOODS[mood].frequency, 0.5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    // Validation checks
    if (trimmedName.length < 2) {
      setErrorMessage('Please enter a name or pseudonym of at least 2 characters.');
      return;
    }
    if (trimmedName.length > 50) {
      setErrorMessage('Name cannot exceed 50 characters.');
      return;
    }
    if (trimmedMessage.length < 3) {
      setErrorMessage('Please write a message of at least 3 characters.');
      return;
    }
    if (trimmedMessage.length > 500) {
      setErrorMessage('Message cannot exceed 500 characters.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        'Supabase PostgreSQL database is not connected yet. Click "Connect Database" below to input your credentials or run the SQL setup script!'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await insertMessage({
        name: trimmedName,
        message: trimmedMessage,
        mood: selectedMood,
      });

      if (error || !data) {
        setErrorMessage(error || 'Failed to record echo in database.');
        setIsSubmitting(false);
        return;
      }

      // Success! Play celebratory sound
      soundEngine.playResonanceChord(activeMoodMeta.frequency);

      // Trigger elegant confetti
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.75 },
        colors: [activeMoodMeta.color, '#C4B5FD', '#FFFFFF'],
        disableForReducedMotion: true,
      });

      setSubmitSuccess(data);
      setName('');
      setMessage('');
      setIsSubmitting(false);

      // Notify parent to prepend/refresh message wall
      onMessageSubmitted(data);

      // Clear success notification after 7 seconds
      setTimeout(() => {
        setSubmitSuccess(null);
      }, 7000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="leave-echo" className="relative py-24 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-violet-400 mb-2">
            02. Leave Your Mark
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 text-balance">
            Cast your voice into the cosmos.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Choose your emotional tone, craft your reflection, and let it echo through
            time for all future travelers to read.
          </p>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              className="mb-8 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-4 shadow-xl shadow-emerald-950/30"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-emerald-200">
                  Your echo has been preserved in Supabase PostgreSQL!
                </div>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Thank you, <span className="font-medium text-white">{submitSuccess.name}</span>.
                  Your message has been added to the top of the Message Wall below.
                </p>
              </div>
              <button
                onClick={() => setSubmitSuccess(null)}
                className="text-xs text-emerald-400 hover:text-emerald-200 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-8 p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-4 shadow-xl shadow-rose-950/30"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-rose-200">Notice</div>
                <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                {errorMessage.includes('database') || errorMessage.includes('Supabase') ? (
                  <button
                    onClick={onOpenDatabaseModal}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Open Supabase Setup Guide</span>
                  </button>
                ) : null}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-6 sm:p-10 rounded-2xl border border-white/[0.08] shadow-2xl relative"
        >
          {/* Mood Selector Strip */}
          <div className="mb-8">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-3">
              1. Select Your Emotional Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {moodList.map((mood) => {
                const isSelected = selectedMood === mood;
                const meta = MOODS[mood];
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => handleMoodSelect(mood)}
                    className={`py-3 px-3 rounded-xl border text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? `${meta.borderClass} ${meta.bgLightClass} shadow-lg scale-[1.02]`
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full mb-0.5"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className={isSelected ? 'text-white font-semibold' : ''}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] opacity-70 font-mono hidden sm:inline">
                      {meta.frequency}Hz
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2 text-right">
              Tone: <span className={activeMoodMeta.textColor}>{activeMoodMeta.tagline}</span>
            </div>
          </div>

          {/* Visitor Name Field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="echo-name" className="text-xs font-mono uppercase tracking-wider text-slate-300">
                2. Your Name or Traveler Pseudonym
              </label>
              <span className="text-xs font-mono text-slate-400">
                {name.length}/50
              </span>
            </div>
            <input
              id="echo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova, Wanderer, Stargazer"
              maxLength={50}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 transition-all"
            />
          </div>

          {/* Message Content Field */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="echo-message" className="text-xs font-mono uppercase tracking-wider text-slate-300">
                3. Your Thought, Story, or Moment
              </label>
              <span
                className={`text-xs font-mono ${
                  message.length > 450 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {message.length}/500
              </span>
            </div>
            <textarea
              id="echo-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a thought for someone who might need it today, an insight from your journey, or simply a hello from your corner of the world..."
              rows={4}
              maxLength={500}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Submit Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Publicly readable & permanently saved</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || name.trim().length < 2 || message.trim().length < 3}
              className="px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 disabled:cursor-not-allowed shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording in Supabase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Immortalize Echo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
