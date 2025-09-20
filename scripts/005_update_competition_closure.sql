-- Update the close_expired_competitions function to include ended_at timestamp
CREATE OR REPLACE FUNCTION close_expired_competitions()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    expired_competition RECORD;
    winner_record RECORD;
BEGIN
    -- Find competitions that have expired (end_date < now) and are still active
    FOR expired_competition IN 
        SELECT id, title, end_date FROM competitions 
        WHERE end_date < NOW() AND is_active = true
    LOOP
        -- Find the winner (participant with highest points)
        SELECT p.user_id, p.points, u.username
        INTO winner_record
        FROM participants p
        JOIN users u ON p.user_id = u.id
        WHERE p.competition_id = expired_competition.id
        ORDER BY p.points DESC, p.joined_at ASC
        LIMIT 1;
        
        -- If there's a winner, record it in history
        IF winner_record.user_id IS NOT NULL THEN
            INSERT INTO competition_history (
                competition_id, 
                winner_id, 
                final_points, 
                ended_at
            )
            VALUES (
                expired_competition.id, 
                winner_record.user_id, 
                winner_record.points,
                COALESCE(expired_competition.end_date, NOW())
            );
        END IF;
        
        -- Mark competition as inactive
        UPDATE competitions 
        SET is_active = false 
        WHERE id = expired_competition.id;
        
        -- Log the closure
        RAISE NOTICE 'Closed competition: % with winner: %', 
            expired_competition.title, 
            COALESCE(winner_record.username, 'No participants');
    END LOOP;
END;
$$;

-- Ensure we have the ended_at column in competition_history
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'competition_history' 
        AND column_name = 'ended_at'
    ) THEN
        ALTER TABLE competition_history 
        ADD COLUMN ended_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;