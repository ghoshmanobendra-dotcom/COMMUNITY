-- REBUILD STORIES TABLE (IDEMPOTENT)
-- This fixes the 42703 Undefined Column error by forcing the correct schema.

-- 1. DROP Existing Table and CASCADE to constraints
DROP TABLE IF EXISTS stories CASCADE;

-- 2. CREATE Table with Exact Columns
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text CHECK (media_type IN ('image','video','text')) NOT NULL,
  caption text,
  visibility text CHECK (visibility IN ('public','followers','campus')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- 3. RLS POLICIES
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Select (Visibility Logic)
CREATE POLICY "story_select"
ON stories
FOR SELECT
USING (
  expires_at > now()
  AND (
    user_id = auth.uid()
    OR visibility = 'public'
    OR (
      visibility = 'followers'
      AND EXISTS (
        SELECT 1 FROM follows
        WHERE follower_id = auth.uid()
        AND following_id = stories.user_id
      )
    )
    OR (
      visibility = 'campus'
      AND EXISTS (
        SELECT 1 FROM profiles p1
        JOIN profiles p2 ON p1.college = p2.college
        WHERE p1.id = auth.uid()
        AND p2.id = stories.user_id
      )
    )
  )
);

-- Policy: Insert (Auth Logic)
CREATE POLICY "story_insert"
ON stories
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND expires_at > created_at
);

-- Policy: Delete (Owner)
CREATE POLICY "story_delete"
ON stories
FOR DELETE
USING (
  user_id = auth.uid()
);


-- 4. RESTORE FOREIGN KEYS (Critical for PostgREST joins)
-- Since we dropped 'stories' with CASCADE, foreign keys in child tables were dropped.
-- We must re-add them to allow fetching 'story_views' and 'story_likes' via join.

-- story_views
DO $$
BEGIN
  -- Drop constraint if it exists (in case it wasn't dropped automatically or has different name)
  ALTER TABLE public.story_views DROP CONSTRAINT IF EXISTS story_views_story_id_fkey;
  
  -- Re-add Constraint
  ALTER TABLE public.story_views 
  ADD CONSTRAINT story_views_story_id_fkey 
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL; -- Ignore if table doesn't exist
END $$;

-- story_likes
DO $$
BEGIN
  ALTER TABLE public.story_likes DROP CONSTRAINT IF EXISTS story_likes_story_id_fkey;
  
  ALTER TABLE public.story_likes 
  ADD CONSTRAINT story_likes_story_id_fkey 
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- story_comments
DO $$
BEGIN
  ALTER TABLE public.story_comments DROP CONSTRAINT IF EXISTS story_comments_story_id_fkey;
  
  ALTER TABLE public.story_comments 
  ADD CONSTRAINT story_comments_story_id_fkey 
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 5. VERIFICATION
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'stories';
