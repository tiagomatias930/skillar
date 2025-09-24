import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function updateDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Executar script das equipas
    const teamsSql = readFileSync(join(__dirname, '006_create_teams_tables.sql'), 'utf8');
    const { error: teamsError } = await supabase.rpc('exec_sql', { sql: teamsSql });
    
    if (teamsError) {
      console.error('Error creating teams tables:', teamsError);
      process.exit(1);
    }

    console.log('Teams tables created successfully');

    // Executar função de fechamento de competições
    const { error: closeError } = await supabase.rpc('close_expired_competitions');
    
    if (closeError) {
      console.error('Error closing expired competitions:', closeError);
    } else {
      console.log('Expired competitions closed successfully');
    }

    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateDatabase();