
-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc_documents',
  'kyc_documents',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS for storage
CREATE POLICY "Authenticated users can upload own KYC"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own KYC"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin can view all KYC"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc_documents' AND get_user_role(auth.uid()) = 'admin'::public.user_role);
