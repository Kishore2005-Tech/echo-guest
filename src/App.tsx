import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ConceptSection } from './components/ConceptSection';
import { MessageForm } from './components/MessageForm';
import { MessageWall } from './components/MessageWall';
import { DatabaseModal } from './components/DatabaseModal';
import { Footer } from './components/Footer';
import { EchoMessage, MoodType } from './types/echo';
import { fetchMessages, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [messages, setMessages] = useState<EchoMessage[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<MoodType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [configured, setConfigured] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const PAGE_SIZE = 9;

  const loadMessages = useCallback(
    async (targetPage = 0, append = false, currentFilter = activeFilter, currentSearch = searchQuery) => {
      setIsLoading(true);
      const isConfig = isSupabaseConfigured();
      setConfigured(isConfig);

      if (!isConfig) {
        setIsLoading(false);
        setMessages([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      const res = await fetchMessages(targetPage, PAGE_SIZE, currentFilter, currentSearch);

      if (!res.error) {
        if (append) {
          setMessages((prev) => [...prev, ...res.data]);
        } else {
          setMessages(res.data);
        }
        setTotalCount(res.count);
        setPage(targetPage);
        setHasMore((targetPage + 1) * PAGE_SIZE < res.count);
      } else {
        // If query error, clear or keep previous
        if (!append) {
          setMessages([]);
          setTotalCount(0);
          setHasMore(false);
        }
      }

      setIsLoading(false);
    },
    [activeFilter, searchQuery]
  );

  // Initial load
  useEffect(() => {
    loadMessages(0, false);
  }, [loadMessages]);

  const handleFilterChange = (filter: MoodType | 'All') => {
    setActiveFilter(filter);
    startTransition(() => {
      loadMessages(0, false, filter, searchQuery);
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    startTransition(() => {
      loadMessages(0, false, activeFilter, query);
    });
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMessages(page + 1, true, activeFilter, searchQuery);
    }
  };

  const handleMessageSubmitted = (newEcho: EchoMessage) => {
    setMessages((prev) => [newEcho, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleConnectionUpdated = () => {
    setConfigured(isSupabaseConfigured());
    loadMessages(0, false);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        messageCount={totalCount}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero
          onLeaveEcho={() => scrollTo('leave-echo')}
          onExploreMessages={() => scrollTo('message-wall')}
          messageCount={totalCount}
        />

        {/* Conceptual Narrative Showcase */}
        <ConceptSection />

        {/* Interactive Message Form */}
        <MessageForm
          onMessageSubmitted={handleMessageSubmitted}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        />

        {/* Message Wall */}
        <MessageWall
          messages={messages}
          isLoading={isLoading}
          isConfigured={configured}
          totalCount={totalCount}
          hasMore={hasMore}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onLoadMore={handleLoadMore}
          onRefresh={() => loadMessages(0, false)}
          onOpenDatabaseModal={() => setIsDbModalOpen(true)}
          onLeaveEcho={() => scrollTo('leave-echo')}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Database & Netlify Setup Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConnectionUpdated={handleConnectionUpdated}
      />
    </div>
  );
}
