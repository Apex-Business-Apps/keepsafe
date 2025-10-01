-- KeepSafe Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS items;

-- Items table
CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(10,2),
    barcode TEXT,
    room TEXT,
    category TEXT,
    receipt_url TEXT,
    photos JSONB DEFAULT '[]',
    warranty_months INTEGER DEFAULT 12,
    recall_match BOOLEAN DEFAULT FALSE,
    recall_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_brand_model ON items (brand, model);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_recall_match ON items (recall_match);

-- Seed some default rooms and categories (commented out for now)
-- These would be handled by the application logic

-- Sample data for testing (uncomment for demo)
/*
INSERT INTO items (name, brand, model, room, category, warranty_months) VALUES 
('Samsung TV', 'Samsung', 'UN55TU8000', 'Living Room', 'Electronics', 24),
('Coffee Maker', 'Keurig', 'K-Classic', 'Kitchen', 'Appliances', 12),
('Vacuum Cleaner', 'Dyson', 'V11', 'Garage', 'Cleaning', 24);
*/