-- Table for auditing administrative changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB
);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON audit_logs
FOR SELECT USING (
    auth.jwt() ->> 'email' = 'a.vargas@mrvargas.co'
);

-- System can insert (if using service role) or specific policy for admin
CREATE POLICY "Admins can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'a.vargas@mrvargas.co'
);
