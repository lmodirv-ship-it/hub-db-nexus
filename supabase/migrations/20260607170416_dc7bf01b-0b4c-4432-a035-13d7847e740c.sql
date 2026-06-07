
CREATE TABLE public.app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  website_id uuid NOT NULL,
  version_name text NOT NULL,
  version_code integer NOT NULL DEFAULT 1,
  file_type text NOT NULL DEFAULT 'apk',
  file_path text,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Published',
  notes text,
  released_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_releases_website ON public.app_releases(website_id, released_at DESC);
CREATE INDEX idx_app_releases_owner ON public.app_releases(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_releases TO authenticated;
GRANT ALL ON public.app_releases TO service_role;

ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_releases_all_own ON public.app_releases
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
