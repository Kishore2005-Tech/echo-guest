import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Search, Database, MessageSquarePlus } from 'lucide-react';
import { EchoMessage, MoodType } from '../types/echo';
import { MessageCard } from './MessageCard';
import { MOODS } from '../lib/constants';

interface MessageWallProps {
  messages: EchoMessage[];
  isLoading: boolean;
  isConfigured: boolean;
  totalCount: number;
  hasMore: boolean;
  activeFilter: MoodType | 'All';
  searchQuery: string;
  onFilterChange: (mood: MoodType | 'All') => void;
  onSearchChange: (query: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onOpenDatabaseModal: () => void;
  onLeaveEcho: () => void;
}

export const MessageWall: React.FC<MessageWallProps> = ({
  messages,
  isLoading,
  isConfigured,
  totalCount,
  hasMore,
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onLoadMore,
  onRefresh,
  onOpenDatabaseModal,
  onLeaveEcho,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filterList: (MoodType | 'All')[] = [
    'All',
    'Happy',
    'Inspired',
    'Grateful',
    'Curious',
    'Peaceful',
  ];

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <section id="message-wall" className="relative py-24 border-t border-white/[0.06] overflow-hidden min-h-[600px]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-violet-400 mb-2">
              03. The Resonance Wall
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 text-balance">
              Voices in the Ether.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Scroll through the living tapestry of messages left by fellow travelers.
              Every echo is preserved in Supabase PostgreSQL.
            </p>
          </div>

          {/* Refresh & Live Status Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isRefreshing}
              className="p-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-mono"
              title="Refresh messages from Supabase"
            >
              <RefreshCw
                className={`w-4 h-4 text-violet-400 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={onLeaveEcho}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Leave Echo</span>
            </button>
          </div>
        </div>

        {/* Database Unconfigured Helper Banner */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 rounded-2xl glass-panel border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-slate-900/40 to-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Connect Your Supabase PostgreSQL Project
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Provide your Supabase URL and publishable Anon key to enable public guestbook reading & writing.
                  Includes a 1-click copyable SQL table script!
                </p>
              </div>
            </div>

            <button
              onClick={onOpenDatabaseModal}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Setup Supabase & Netlify
            </button>
          </motion.div>
        )}

        {/* Filter & Search Bar */}
        <div className="mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Mood Filter Tabs (Interactive Segmented Control) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#0e0e16] border border-white/[0.08] rounded-xl overflow-x-auto no-scrollbar">
            {filterList.map((mood) => {
              const isActive = activeFilter === mood;
              const meta = mood !== 'All' ? MOODS[mood] : null;

              return (
                <button
                  key={mood}
                  onClick={() => onFilterChange(mood)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {meta && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isActive ? '#FFFFFF' : meta.color }}
                    />
                  )}
                  <span>{mood}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search echoes or names..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0e16] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Messages Count Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-mono">
          <div className="flex items-center gap-2">
            <span>Displaying</span>
            <span className="text-violet-300 font-bold tabular-nums">
              {messages.length}
            </span>
            <span>of</span>
            <span className="text-white font-bold tabular-nums">
              {totalCount}
            </span>
            <span>echoes</span>
            {activeFilter !== 'All' && (
              <>
                <span>·</span>
                <span className="text-violet-400 font-medium">{activeFilter}</span>
              </>
            )}
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Ordered newest first
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 min-h-[180px] animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.04] rounded w-full" />
                  <div className="h-4 bg-white/[0.04] rounded w-5/6" />
                </div>
                <div className="h-4 bg-white/[0.05] rounded w-1/2 mt-6" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && messages.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto border border-white/[0.08]">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              No Echoes Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {searchQuery
                ? `No echoes matching "${searchQuery}". Try a different keyword or reset filters.`
                : activeFilter !== 'All'
                ? `No echoes with mood "${activeFilter}" yet. Be the first to leave one!`
                : 'The wall is quiet. Cast your thought and be the inaugural voice in this universe.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchQuery || activeFilter !== 'All' ? (
                <button
                  onClick={() => {
                    onFilterChange('All');
                    onSearchChange('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                onClick={onLeaveEcho}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors"
              >
                Leave First Echo
              </button>
            </div>
          </div>
        )}

        {/* Message Cards Grid (3 Columns on Desktop) */}
        {messages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {messages.map((echo, index) => (
                <MessageCard key={echo.id || `${echo.name}-${index}`} echo={echo} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination: Load More Action */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] hover:border-violet-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-lg cursor-pointer"
            >
              {isLoading ? 'Loading more echoes...' : 'Load More Echoes'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
