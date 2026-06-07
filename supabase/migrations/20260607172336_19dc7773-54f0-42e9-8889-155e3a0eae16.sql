
ALTER TABLE public.databases
  ADD COLUMN IF NOT EXISTS last_check_ms integer,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS backup_schedule text NOT NULL DEFAULT 'off',
  ADD COLUMN IF NOT EXISTS next_backup_at timestamptz;

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  database_id uuid,
  website_id uuid,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_all_own ON public.alerts
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS alerts_owner_created_idx ON public.alerts(owner_id, created_at DESC);
