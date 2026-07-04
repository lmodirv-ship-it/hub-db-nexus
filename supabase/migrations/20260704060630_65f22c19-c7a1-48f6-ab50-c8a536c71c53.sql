-- external_schema_mirrors
CREATE TABLE public.external_schema_mirrors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  target_name text NOT NULL,
  schema_name text NOT NULL DEFAULT 'public',
  tables_count integer NOT NULL DEFAULT 0,
  payload_hash text,
  tables_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  last_sync_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_name, target_name)
);
GRANT SELECT ON public.external_schema_mirrors TO authenticated;
GRANT ALL ON public.external_schema_mirrors TO service_role;
ALTER TABLE public.external_schema_mirrors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read mirrors" ON public.external_schema_mirrors
  FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_external_schema_mirrors_updated_at
  BEFORE UPDATE ON public.external_schema_mirrors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- external_data_rows
CREATE TABLE public.external_data_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  table_name text NOT NULL,
  row_pk text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_name, table_name, row_pk)
);
GRANT SELECT ON public.external_data_rows TO authenticated;
GRANT ALL ON public.external_data_rows TO service_role;
ALTER TABLE public.external_data_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read external rows" ON public.external_data_rows
  FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_external_data_rows_updated_at
  BEFORE UPDATE ON public.external_data_rows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_external_data_rows_source_table ON public.external_data_rows (source_name, table_name);
CREATE INDEX idx_external_data_rows_received_at ON public.external_data_rows (received_at DESC);