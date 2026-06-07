-- Run in Supabase SQL Editor

create table if not exists transcripts (
  id              text        primary key,
  filename        text        not null,
  whisper_model   text,
  status          text        not null default 'processing',
  language        text,
  whisper_result  jsonb,   -- { engine, model, language, full_text, segments, duration_seconds, elapsed_seconds }
  sarvam_result   jsonb,   -- { engine, model, language, full_text, segments, duration_seconds, elapsed_seconds, error? }
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz
);
