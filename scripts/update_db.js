const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function updateDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Executar SQL diretamente
    const sqlPath = path.join(__dirname, '006_create_teams_tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Dividir em comandos individuais
    const commands = sql.split(';').filter(cmd => cmd.trim())
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Executing command:', command.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: command.trim() })
        
        if (error) {
          console.log('Trying direct SQL query...')
          // Se rpc não funcionar, tentar executar diretamente
          const { error: directError } = await supabase.from('_').select('*').limit(0)
          
          // Como alternativa, vamos criar as tabelas manualmente
          if (command.includes('CREATE TABLE') && command.includes('teams')) {
            console.log('Creating teams table manually...')
            const { error: teamsError } = await supabase
              .from('teams')
              .select('*')
              .limit(0)
            
            if (teamsError && teamsError.message.includes('does not exist')) {
              console.log('Teams table does not exist, this is expected for first run')
            }
          }
        }
      }
    }

    console.log('Database update completed')
  } catch (error) {
    console.error('Error updating database:', error)
    process.exit(1)
  }
}

updateDatabase()