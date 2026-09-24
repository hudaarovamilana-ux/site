-- PostgreSQL schema для сайта «Женская консультация»
-- Railway: создайте PostgreSQL plugin и примените эту схему

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_status AS ENUM ('pregnant', 'not_pregnant', 'planning');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
CREATE TYPE checklist_status AS ENUM ('none', 'planned', 'done');

CREATE TABLE web_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    status user_status,
    telegram_user_id BIGINT UNIQUE,
    subscription subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    free_health_assessments_used INT DEFAULT 0,
    priority_questions_remaining INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_health_profile (
    user_id UUID PRIMARY KEY REFERENCES web_users(id) ON DELETE CASCADE,
    blood_type TEXT,
    height_cm INT,
    weight_kg REAL,
    chronic_conditions TEXT,
    cycle_day INT,
    last_ultrasound_date DATE,
    never_had_ultrasound BOOLEAN DEFAULT FALSE,
    last_gynecologist_visit DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pregnancy_data (
    user_id UUID PRIMARY KEY REFERENCES web_users(id) ON DELETE CASCADE,
    week INT,
    pregnancy_day INT DEFAULT 0,
    due_date DATE,
    last_period_date DATE,
    source TEXT,
    date_input TEXT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trimester_checklist (
    user_id UUID REFERENCES web_users(id) ON DELETE CASCADE,
    trimester INT NOT NULL,
    item_key TEXT NOT NULL,
    status checklist_status DEFAULT 'none',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, trimester, item_key)
);

CREATE TABLE kick_counts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES web_users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INT DEFAULT 0,
    start_time TIMESTAMPTZ,
    last_kick_time TIMESTAMPTZ,
    UNIQUE (user_id, date)
);

CREATE TABLE user_questions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES web_users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    ai_answer TEXT,
    expert_reply TEXT,
    status TEXT DEFAULT 'pending',
    is_priority BOOLEAN DEFAULT FALSE,
    pregnancy_week INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expert_replied_at TIMESTAMPTZ
);

CREATE TABLE preventive_checklist (
    user_id UUID REFERENCES web_users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    last_done_date DATE,
    status checklist_status DEFAULT 'none',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, item_key)
);

CREATE INDEX idx_web_users_telegram ON web_users(telegram_user_id);
CREATE INDEX idx_user_questions_status ON user_questions(status, created_at);
