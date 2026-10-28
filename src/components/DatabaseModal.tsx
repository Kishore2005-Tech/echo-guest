import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Save,
  Trash2,
  Play,
  Globe,
  Sparkles,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/constants';
import {
  getEffectiveCredentials,
  saveCustomCredentials,
  clearCustomCredentials,
  testConnection,
  seedSampleEchoes,
} from '../lib/supabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionUpdated: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionUpdated,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'sql' | 'credentials' | 'netlify'>('setup');
  const [testResult, setTestResult] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
    count?: number;
  }>({ testing: false });

  useEffect(() => {
    if (isOpen) {
      const creds = getEffectiveCredentials();
      setSupabaseUrl(creds.url);
      setSupabaseKey(creds.key);
      setIsCustom(creds.isCustom);
      setTestResult({ testing: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;
    saveCustomCredentials(supabaseUrl.trim(), supabaseKey.trim());
    setIsCustom(true);
    onConnectionUpdated();
    handleRunTest();
  };

  const handleClearCredentials = () => {
    clearCustomCredentials();
    const creds = getEffectiveCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.key);
    setIsCustom(false);
    onConnectionUpdated();
    setTestResult({
      testing: false,
      message: 'Custom credentials cleared. Reset to environment variables.',
    });
  };

  const handleRunTest = async () => {
    setTestResult({ testing: true });
    const res = await testConnection();
    setTestResult({
      testing: false,
      success: res.success,
      message: res.message,
      count: res.count,
    });
  };

  const handleSeed = async () => {
    setTestResult({ testing: true, message: 'Seeding starter echoes into public.echo_messages...' });
    const res = await seedSampleEchoes();
    setTestResult({
      testing: false,
      success: res.success,
      message: res.message,
      count: res.count,
    });
    if (res.success) {
      onConnectionUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-panel w-full max-w-3xl rounded-3xl border border-white/10 p-6 sm:p-8 bg-[#0b0b12] text-slate-100 shadow-2xl relative my-8"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Supabase & Netlify Integration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your PostgreSQL database and deploy to Netlify
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pt-4 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            1. Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            2. SQL Schema Script
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            3. Live Credentials & Diagnostic
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'netlify'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            4. Netlify Deployment
          </button>
        </div>

        {/* Tab 1: Setup Guide */}
        {activeTab === 'setup' && (
          <div className="py-6 space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-violet-200">
              <span className="font-semibold text-white">How it works:</span> ECHO connects
              directly to your Supabase PostgreSQL database using client-side Row Level Security (RLS).
              No server or secret keys are needed.
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.08] text-violet-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-white text-sm">Create a free Supabase project</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Visit{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and create a new project.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.08] text-violet-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-white text-sm">Execute the Database SQL Script</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Open your Supabase project's <strong>SQL Editor</strong>, switch to the{' '}
                    <button
                      onClick={() => setActiveTab('sql')}
                      className="text-violet-400 underline font-medium cursor-pointer"
                    >
                      SQL Schema tab
                    </button>
                    , click <em>Copy SQL</em>, and run it. This creates the <code className="text-violet-300">echo_messages</code> table and secure public policies.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.08] text-violet-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-white text-sm">Copy API Credentials</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    In Supabase, navigate to <strong>Project Settings</strong> → <strong>API</strong>. Copy your{' '}
                    <code className="text-violet-300">Project URL</code> and the public{' '}
                    <code className="text-violet-300">anon public</code> key.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.08] text-violet-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="font-medium text-white text-sm">Connect & Test</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste them into the{' '}
                    <button
                      onClick={() => setActiveTab('credentials')}
                      className="text-violet-400 underline font-medium cursor-pointer"
                    >
                      Credentials tab
                    </button>{' '}
                    for instant live testing, or set them as <code className="text-violet-300">VITE_SUPABASE_URL</code> and{' '}
                    <code className="text-violet-300">VITE_SUPABASE_ANON_KEY</code> in Netlify or <code className="text-slate-300">.env</code>.
                  </p>
                </div>
              </li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('sql')}
                className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors cursor-pointer"
              >
                Next: View SQL Schema →
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: SQL Schema Script */}
        {activeTab === 'sql' && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>echo_messages table & RLS policies</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Schema</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-black/70 border border-white/10 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-violet-500/30">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="text-xs text-slate-400 flex items-start gap-2 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
              <ShieldAlert className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>
                Row Level Security (RLS) protects your database: anyone can read messages and submit new ones (validated between 3 and 500 characters), while unauthorized updates and deletes are permanently rejected.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Live Credentials & Diagnostic */}
        {activeTab === 'credentials' && (
          <div className="py-6 space-y-6">
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  VITE_SUPABASE_ANON_KEY (Public Anon Key)
                </label>
                <input
                  type="text"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply & Save Credentials</span>
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={testResult.testing}
                    className="px-3.5 py-2 text-xs font-mono text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-violet-400" />
                    <span>{testResult.testing ? 'Pinging...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSeed}
                    disabled={testResult.testing}
                    title="Insert 5 sample starter echoes into public.echo_messages"
                    className="px-3.5 py-2 text-xs font-mono text-violet-200 bg-violet-950/40 hover:bg-violet-900/50 rounded-xl border border-violet-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span>Seed Samples</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Test Connection Output */}
            {testResult.message && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-2 mb-1">
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  <span>
                    {testResult.success ? 'Diagnostic Successful' : 'Connection Alert'}
                  </span>
                </div>
                <p>{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Netlify Deployment */}
        {activeTab === 'netlify' && (
          <div className="py-6 space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-200 flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Netlify Ready:</span> The project contains a pre-configured <code className="text-white">netlify.toml</code> with SPA 200 rewrite routing and production output targeting the <code className="text-white">dist</code> directory.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-medium text-white text-sm">Deployment Steps:</h4>
              <div className="bg-black/50 p-4 rounded-xl border border-white/[0.08] space-y-2 font-mono text-[11px]">
                <p className="text-slate-400"># 1. Build and preview locally</p>
                <p className="text-violet-300">npm run build</p>
                <p className="text-violet-300">npm run preview</p>
                <p className="text-slate-400 pt-2"># 2. Netlify Build Configuration</p>
                <p className="text-slate-300">Build command: <span className="text-white">npm run build</span></p>
                <p className="text-slate-300">Publish directory: <span className="text-white">dist</span></p>
                <p className="text-slate-400 pt-2"># 3. Environment Variables (in Netlify Site Settings)</p>
                <p className="text-emerald-300">VITE_SUPABASE_URL = your-supabase-project-url</p>
                <p className="text-emerald-300">VITE_SUPABASE_ANON_KEY = your-supabase-anon-key</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Once deployed, every visitor to your Netlify site will see and contribute to the same live Supabase PostgreSQL database in real time!
            </p>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
