-- NOVA OS Supabase PostgreSQL Initial Schema & RLS Policies
-- Migration: 20250101_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. GOOGLE ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS google_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    google_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    scopes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. OAUTH TOKENS TABLE (Encrypted at rest)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_account_id UUID NOT NULL REFERENCES google_accounts(id) ON DELETE CASCADE,
    encrypted_refresh_token TEXT,
    token_metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AGENT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Mission Command',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AGENT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AGENT RUNS / MISSIONS TABLE
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES agent_conversations(id) ON DELETE SET NULL,
    mission_code TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED')),
    plan JSONB DEFAULT '[]'::jsonb,
    execution_trace JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. AGENT ACTIONS TABLE
CREATE TABLE IF NOT EXISTS agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES agent_conversations(id) ON DELETE SET NULL,
    run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'google',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    status TEXT NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTING', 'COMPLETED', 'FAILED')),
    request_payload JSONB NOT NULL,
    response_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. APPROVAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_id UUID REFERENCES agent_actions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. CONNECTED SERVICES TABLE
CREATE TABLE IF NOT EXISTS connected_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL CHECK (service_name IN ('gmail', 'calendar', 'sheets', 'gemini')),
    status TEXT NOT NULL DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'ERROR', 'REVOKED')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, service_name)
);

-- 10. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sound_enabled BOOLEAN DEFAULT true,
    hologram_quality TEXT DEFAULT 'high',
    default_sheet_id TEXT,
    approval_threshold TEXT DEFAULT 'HIGH_ONLY',
    voice_feedback_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. AUTOMATIONS TABLE
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    schedule_cron TEXT NOT NULL,
    agent_instruction TEXT NOT NULL,
    tools_allowed TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_google_accounts_user ON google_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conv ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_user ON agent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_user_status ON approval_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES (Users access only their own records)
CREATE POLICY users_isolation ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY google_accounts_isolation ON google_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY agent_conversations_isolation ON agent_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY agent_runs_isolation ON agent_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY agent_actions_isolation ON agent_actions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY approval_requests_isolation ON approval_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY connected_services_isolation ON connected_services FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_preferences_isolation ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY automations_isolation ON automations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY audit_logs_isolation ON audit_logs FOR ALL USING (auth.uid() = user_id);
