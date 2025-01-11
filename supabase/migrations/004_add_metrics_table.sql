CREATE TABLE speech_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID NOT NULL,
  total_attempts INTEGER NOT NULL,
  valid_speech INTEGER NOT NULL,
  invalid_speech INTEGER NOT NULL,
  transcription_errors INTEGER NOT NULL,
  average_confidence DECIMAL NOT NULL,
  success_rate DECIMAL NOT NULL,
  invalid_phrases JSONB,
  metadata JSONB
);

-- Index for efficient querying
CREATE INDEX speech_metrics_timestamp_idx ON speech_metrics(timestamp);
CREATE INDEX speech_metrics_session_idx ON speech_metrics(session_id); 