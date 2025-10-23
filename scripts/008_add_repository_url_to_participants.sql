-- Add repository_url column to participants table
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS repository_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_repository_url ON participants(repository_url);

-- Add comment
COMMENT ON COLUMN participants.repository_url IS 'GitHub repository URL for the participant project';
