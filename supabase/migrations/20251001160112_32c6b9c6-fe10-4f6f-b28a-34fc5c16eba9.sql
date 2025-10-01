-- Create items table for household inventory
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  purchase_date DATE,
  warranty_months INTEGER,
  price DECIMAL(10,2),
  serial_number TEXT,
  barcode TEXT,
  receipt_photo_url TEXT,
  notes TEXT,
  recall_match BOOLEAN DEFAULT false,
  recall_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own items
CREATE POLICY "Users can view own items"
  ON public.items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON public.items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for receipt photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts
CREATE POLICY "Users can view own receipts"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own receipts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own receipts"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own receipts"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);