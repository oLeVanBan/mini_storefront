-- Migration 003: Supabase Storage bucket for product images

-- Create public bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow service_role to upload (admin writes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'product_images_admin_insert'
  ) THEN
    CREATE POLICY "product_images_admin_insert"
      ON storage.objects FOR INSERT TO service_role
      WITH CHECK (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'product_images_admin_update'
  ) THEN
    CREATE POLICY "product_images_admin_update"
      ON storage.objects FOR UPDATE TO service_role
      USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'product_images_admin_delete'
  ) THEN
    CREATE POLICY "product_images_admin_delete"
      ON storage.objects FOR DELETE TO service_role
      USING (bucket_id = 'product-images');
  END IF;

  -- Public read (bucket is public, but explicit policy for clarity)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'product_images_public_read'
  ) THEN
    CREATE POLICY "product_images_public_read"
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;
