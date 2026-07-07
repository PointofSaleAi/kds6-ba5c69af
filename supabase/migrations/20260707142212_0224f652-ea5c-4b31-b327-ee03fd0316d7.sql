CREATE POLICY "Public read recipe-videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'recipe-videos');