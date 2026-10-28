import { MoodType } from '../types/echo';

export interface MoodMeta {
  type: MoodType;
  label: string;
  tagline: string;
  color: string;
  glowClass: string;
  borderClass: string;
  bgLightClass: string;
  textColor: string;
  frequency: number; // Hz for Web Audio synthesizer chime
}

export const MOODS: Record<MoodType, MoodMeta> = {
  Happy: {
    type: 'Happy',
    label: 'Happy',
    tagline: 'Radiant warmth and joyous spirit',
    color: '#F59E0B',
    glowClass: 'glow-amber',
    borderClass: 'border-amber-500/30 hover:border-amber-400/60',
    bgLightClass: 'bg-amber-500/10 text-amber-300',
    textColor: 'text-amber-300',
    frequency: 528, // 528Hz Solfeggio "transformation & miracles"
  },
  Inspired: {
    type: 'Inspired',
    label: 'Inspired',
    tagline: 'Sparks of imagination & wonder',
    color: '#8B5CF6',
    glowClass: 'glow-violet',
    borderClass: 'border-violet-500/30 hover:border-violet-400/60',
    bgLightClass: 'bg-violet-500/10 text-violet-300',
    textColor: 'text-violet-300',
    frequency: 639, // 639Hz Solfeggio "connecting relationships"
  },
  Grateful: {
    type: 'Grateful',
    label: 'Grateful',
    tagline: 'Heartfelt appreciation & warmth',
    color: '#F43F5E',
    glowClass: 'glow-rose',
    borderClass: 'border-rose-500/30 hover:border-rose-400/60',
    bgLightClass: 'bg-rose-500/10 text-rose-300',
    textColor: 'text-rose-300',
    frequency: 432, // 432Hz "natural harmony"
  },
  Curious: {
    type: 'Curious',
    label: 'Curious',
    tagline: 'Questions, mysteries, and wonders',
    color: '#06B6D4',
    glowClass: 'glow-cyan',
    borderClass: 'border-cyan-500/30 hover:border-cyan-400/60',
    bgLightClass: 'bg-cyan-500/10 text-cyan-300',
    textColor: 'text-cyan-300',
    frequency: 741, // 741Hz "awakening intuition"
  },
  Peaceful: {
    type: 'Peaceful',
    label: 'Peaceful',
    tagline: 'Quiet reflection, stillness, calm',
    color: '#3B82F6',
    glowClass: 'glow-blue',
    borderClass: 'border-blue-500/30 hover:border-blue-400/60',
    bgLightClass: 'bg-blue-500/10 text-blue-300',
    textColor: 'text-blue-300',
    frequency: 396, // 396Hz "liberating guilt & fear"
  },
};

export const SUPABASE_SQL_SCHEMA = `-- 1. Create table echo_messages for the digital guestbook
CREATE TABLE IF NOT EXISTS public.echo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
  message TEXT NOT NULL CHECK (char_length(message) >= 3 AND char_length(message) <= 500),
  mood TEXT NOT NULL CHECK (mood IN ('Happy', 'Inspired', 'Grateful', 'Curious', 'Peaceful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create index on created_at for fast descending queries
CREATE INDEX IF NOT EXISTS idx_echo_messages_created_at ON public.echo_messages (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.echo_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anyone (anonymous or authenticated) to read messages
DROP POLICY IF EXISTS "Allow public read access" ON public.echo_messages;
CREATE POLICY "Allow public read access" 
  ON public.echo_messages 
  FOR SELECT 
  USING (true);

-- 5. Policy: Allow anyone to insert clean messages with validated fields
DROP POLICY IF EXISTS "Allow public insert access" ON public.echo_messages;
CREATE POLICY "Allow public insert access" 
  ON public.echo_messages 
  FOR INSERT 
  WITH CHECK (
    char_length(name) >= 2 AND char_length(name) <= 50 AND
    char_length(message) >= 3 AND char_length(message) <= 500 AND
    mood IN ('Happy', 'Inspired', 'Grateful', 'Curious', 'Peaceful')
  );

-- 6. Disallow anonymous updates & deletes (only select & insert are granted)
-- Row level security blocks UPDATE and DELETE by default since no policy permits them!

-- 7. (Optional) Seed 5 initial starter echoes:
INSERT INTO public.echo_messages (name, message, mood) VALUES
  ('Astrid Vance', 'Every word we whisper into this digital ocean finds an ear somewhere across the dark.', 'Inspired'),
  ('Marcus Chen', 'Grateful for quiet mornings, warm tea, and the unexpected kindness of strangers.', 'Grateful'),
  ('Lyra Sol', 'Is time just memory moving in a circle, or are we constantly making new ground?', 'Curious'),
  ('Soren K.', 'Finding calm in the spaces between thoughts today. May this stillness reach you.', 'Peaceful'),
  ('Amara Diop', 'We built something beautiful together today. Celebrating the small victories.', 'Happy');
`;
