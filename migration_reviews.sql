-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT NOT NULL, -- Flexible for our mnemonic IDs
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_location TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    recommend BOOLEAN DEFAULT true,
    publish_authorized BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add feedback_token to bookings if we want to store it, or just use booking_id + hash
-- For now, let's just use the booking_id as part of the link for simplicity if it's unique enough, 
-- but a dedicated token is better for "secure/expiration".
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_token TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT false;

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
-- 1. Public can read approved reviews
CREATE POLICY "Allow public read approved reviews" ON reviews
FOR SELECT USING (status = 'approved' AND publish_authorized = true);

-- 2. Public can insert reviews (via the secure form)
CREATE POLICY "Allow public insert reviews" ON reviews
FOR INSERT WITH CHECK (true);

-- 3. Admin (service role) has full control
-- (Admin uses supabaseAdmin which bypasses RLS, but for good measure):
CREATE POLICY "Admin full access reviews" ON reviews
FOR ALL USING (auth.jwt() ->> 'email' = 'a.vargas@mrvargas.co');

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
