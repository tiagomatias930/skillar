import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function updateDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const sql = readFileSync(join(__dirname, '005_update_competition_closure.sql'), 'utf8');
  const { error } = await supabase.rpc('close_expired_competitions');
  
  if (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }

  console.log('Database updated successfully');
}