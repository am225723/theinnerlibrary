-- =====================================================
-- The Inner Library - Supabase SQL Schema
-- =====================================================
-- Run this in the Supabase SQL Editor to set up
-- the complete database schema with RLS policies.
-- =====================================================

-- =====================================================
-- 1. USER PROFILES
-- =====================================================
-- Stores user metadata including role (client vs therapist/admin)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'therapist', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Therapist-specific fields
  license_number TEXT,
  specialization TEXT[],
  bio TEXT,

  -- Client-specific fields
  preferred_name TEXT,
  therapist_id UUID REFERENCES public.profiles(id),

  -- Onboarding
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  crisis_acknowledged_at TIMESTAMPTZ
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Therapists can view their assigned clients
CREATE POLICY "Therapists can view assigned clients"
  ON public.profiles FOR SELECT
  USING (
    role = 'therapist' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'therapist'
    ) AND
    therapist_id = auth.uid()
  );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. BOOK CUSTOMIZATIONS
-- =====================================================
-- Stores per-user book cover customization data

CREATE TABLE IF NOT EXISTS public.book_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL, -- matches book.id from CORE_BOOKS
  
  -- Cover colors
  cover_color TEXT NOT NULL DEFAULT '#1B2A4A',
  spine_color TEXT NOT NULL DEFAULT '#1B2A4A',
  accent_color TEXT NOT NULL DEFAULT '#B8922A',
  text_color TEXT NOT NULL DEFAULT '#B8922A',
  
  -- Material
  material_preset TEXT NOT NULL DEFAULT 'leather' CHECK (material_preset IN ('leather', 'cloth', 'paper', 'velvet', 'modern', 'linen')),
  
  -- Cover style
  cover_style TEXT NOT NULL DEFAULT 'gilt_border' CHECK (cover_style IN ('gilt_border', 'gilt_center', 'modern_title', 'embossed', 'watercolor', 'minimal')),
  
  -- Spine
  spine_text TEXT,
  spine_font_size INTEGER NOT NULL DEFAULT 20,
  spine_style TEXT NOT NULL DEFAULT 'raised_bands' CHECK (spine_style IN ('raised_bands', 'flat', 'grooved')),
  
  -- Embossing
  embossing_enabled BOOLEAN NOT NULL DEFAULT false,
  embossing_depth REAL NOT NULL DEFAULT 0.5,
  embossing_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Ribbon
  ribbon_color TEXT NOT NULL DEFAULT '#B8922A',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Each user can only have one customization per book
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.book_customizations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own customizations
CREATE POLICY "Users can view own book customizations"
  ON public.book_customizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own book customizations"
  ON public.book_customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own book customizations"
  ON public.book_customizations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own book customizations"
  ON public.book_customizations FOR DELETE
  USING (auth.uid() = user_id);

-- Therapists can view (but not modify) client book customizations
CREATE POLICY "Therapists can view client customizations"
  ON public.book_customizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'therapist'
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = book_customizations.user_id AND therapist_id = auth.uid()
    )
  );

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_book_customization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_book_customization_update
  BEFORE UPDATE ON public.book_customizations
  FOR EACH ROW EXECUTE FUNCTION public.update_book_customization_timestamp();

-- =====================================================
-- 3. JOURNAL ENTRIES
-- =====================================================
-- Stores all tool entries (check-ins, needs, boundaries, etc.)

CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Tool identification
  tool_id TEXT NOT NULL CHECK (tool_id IN (
    'daily_checkin',
    'needs_translator',
    'boundary_scripts',
    'cognitive_reframe',
    'evidence_shelf',
    'character_notes',
    'younger_self',
    'session_prep'
  )),
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Entry content
  user_input TEXT, -- What the user wrote
  selected_emotion TEXT, -- Primary emotion/feeling selected
  selected_need TEXT, -- Need selected (for needs_translator)
  selected_part TEXT, -- Part selected (for character_notes)
  generated_output TEXT, -- Generated reflection/reframe/script
  notes TEXT, -- Additional user notes
  
  -- Evidence shelf specific
  evidence TEXT, -- Evidence item selected
  spine_color TEXT, -- Spine color for evidence shelf
  
  -- Tags for filtering
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Bookmarking
  bookmarked BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Users can manage their own entries
CREATE POLICY "Users can view own entries"
  ON public.entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON public.entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.entries FOR DELETE
  USING (auth.uid() = user_id);

-- Therapists can view entries of assigned clients (read-only)
CREATE POLICY "Therapists can view client entries"
  ON public.entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'therapist'
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = entries.user_id AND therapist_id = auth.uid()
    )
  );

-- Auto-update timestamp
CREATE TRIGGER on_entry_update
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.update_book_customization_timestamp();

-- =====================================================
-- 4. INDEXES for performance
-- =====================================================

-- Entries indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_tool_id ON public.entries(user_id, tool_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_bookmarked ON public.entries(user_id, bookmarked) WHERE bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_entries_tags ON public.entries USING gin(tags);

-- Book customizations indexes
CREATE INDEX IF NOT EXISTS idx_book_customizations_user_id ON public.book_customizations(user_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_therapist_id ON public.profiles(therapist_id) WHERE therapist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 5. HELPER VIEWS
-- =====================================================

-- Therapist dashboard: client summary
CREATE OR REPLACE VIEW public.therapist_client_summary AS
SELECT
  c.id AS client_id,
  c.display_name AS client_name,
  c.preferred_name,
  c.email,
  COUNT(DISTINCT e.id) AS total_entries,
  COUNT(DISTINCT e.id) FILTER (WHERE e.date > now() - interval '7 days') AS entries_last_7_days,
  MAX(e.date) AS last_entry_date,
  ARRAY_AGG(DISTINCT e.tool_id) AS tools_used,
  c.onboarding_complete
FROM public.profiles c
LEFT JOIN public.entries e ON e.user_id = c.id
WHERE c.therapist_id = auth.uid()
  AND c.role = 'client'
GROUP BY c.id, c.display_name, c.preferred_name, c.email, c.onboarding_complete;

-- =====================================================
-- 6. STORAGE BUCKETS
-- =====================================================
-- For storing avatar images and other user uploads

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view avatars (they're public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- =====================================================
-- 7. MIGRATION NOTES
-- =====================================================
-- To migrate existing localStorage data to Supabase:
--
-- 1. After auth is implemented, add a migration screen
--    that reads from localStorage and POSTs to Supabase
-- 2. The book_customizations table matches the structure
--    of the current useCoverDesigner hook's save format
-- 3. The entries table matches the structure of the
--    current saveEntry() function in utils/storage.js
--
-- Example migration script for entries:
-- const localEntries = JSON.parse(localStorage.getItem('innerLibrary_entries') || '[]');
-- for (const entry of localEntries) {
--   await supabase.from('entries').insert({
--     user_id: user.id,
--     tool_id: entry.toolId,
--     tool_name: entry.toolName,
--     category: entry.category,
--     user_input: entry.userInput,
--     selected_emotion: entry.selectedEmotion,
--     selected_need: entry.selectedNeed,
--     selected_part: entry.selectedPart,
--     generated_output: entry.generatedOutput,
--     notes: entry.notes,
--     tags: entry.tags,
--     bookmarked: entry.bookmarked,
--     date: entry.date,
--   });
-- }
--
-- Example migration for book customizations:
-- const covers = JSON.parse(localStorage.getItem('innerLibrary_covers') || '{}');
-- for (const [bookId, cover] of Object.entries(covers)) {
--   await supabase.from('book_customizations').insert({
--     user_id: user.id,
--     book_id: bookId,
--     cover_color: cover.colors.cover,
--     spine_color: cover.colors.spine,
--     accent_color: cover.colors.accent,
--     text_color: cover.colors.text,
--     material_preset: cover.material,
--     cover_style: cover.coverStyle || 'gilt_border',
--     spine_text: cover.spine.text,
--     spine_font_size: cover.spine.fontSize,
--     spine_style: cover.spine.style || 'raised_bands',
--     embossing_enabled: cover.embossing?.enabled || false,
--     embossing_depth: cover.embossing?.depth || 0.5,
--     embossing_elements: cover.embossing?.elements || [],
--     ribbon_color: cover.ribbonColor || '#B8922A',
--   });
-- }
