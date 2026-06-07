
CREATE POLICY "app_releases_owner_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'app-releases' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'app-releases' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "app_assets_owner_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
