
-- ============== workspaces ==============
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'lovable',
  external_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workspaces" ON public.workspaces FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== integrations ==============
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  provider text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'connected',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own integrations" ON public.integrations FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== environments ==============
CREATE TABLE IF NOT EXISTS public.environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  website_id uuid REFERENCES public.websites(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text,
  branch text,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.environments TO authenticated;
GRANT ALL ON public.environments TO service_role;
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own environments" ON public.environments FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_environments_updated BEFORE UPDATE ON public.environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== deployments ==============
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  website_id uuid REFERENCES public.websites(id) ON DELETE CASCADE,
  environment_id uuid REFERENCES public.environments(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'lovable',
  commit_sha text,
  status text NOT NULL DEFAULT 'pending',
  url text,
  log text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deployments TO authenticated;
GRANT ALL ON public.deployments TO service_role;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deployments" ON public.deployments FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ============== api_tokens ==============
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  token_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_tokens TO authenticated;
GRANT ALL ON public.api_tokens TO service_role;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tokens" ON public.api_tokens FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ============== secrets_vault ==============
CREATE TABLE IF NOT EXISTS public.secrets_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  website_id uuid REFERENCES public.websites(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secrets_vault TO authenticated;
GRANT ALL ON public.secrets_vault TO service_role;
ALTER TABLE public.secrets_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own secrets" ON public.secrets_vault FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_secrets_updated BEFORE UPDATE ON public.secrets_vault FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== schedules ==============
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  cron text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedules TO authenticated;
GRANT ALL ON public.schedules TO service_role;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own schedules" ON public.schedules FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_schedules_updated BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== notifications ==============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  channel text NOT NULL DEFAULT 'in_app',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ============== audit_log ==============
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own audit read" ON public.audit_log FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "own audit write" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- ============== settings ==============
CREATE TABLE IF NOT EXISTS public.settings (
  owner_id uuid PRIMARY KEY,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.settings FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Ensure both roles for all current users =====
INSERT INTO public.user_roles (user_id, role) SELECT id, 'user'::app_role FROM public.profiles ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin'::app_role FROM public.profiles ON CONFLICT (user_id, role) DO NOTHING;
