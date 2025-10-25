const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando variáveis de ambiente...');
console.log('Supabase URL:', supabaseUrl ? '✅ Definida' : '❌ NÃO definida');
console.log('Supabase Key:', supabaseKey ? '✅ Definida' : '❌ NÃO definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = fs.readFileSync(__dirname + '/009_create_teams_tables.sql', 'utf8');

console.log('\n📝 Script SQL carregado');
console.log('📊 Executando migração...\n');

(async () => {
  try {
    // Execute the full SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try executing via raw SQL
      if (error.message.includes('exec_sql') || error.code === '42883') {
        console.log('⚠️  Função exec_sql não disponível');
        console.log('📋 Por favor, execute o SQL manualmente no Supabase Dashboard:');
        console.log('\n' + '='.repeat(60));
        console.log(sql);
        console.log('='.repeat(60));
        console.log('\n💡 Acesse: https://app.supabase.com → SQL Editor → Cole o script acima');
      } else {
        console.error('❌ Erro ao executar SQL:', error.message);
        console.error('Detalhes:', error);
      }
    } else {
      console.log('✅ Migração executada com sucesso!');
      console.log('🎉 Tabelas de teams criadas:');
      console.log('   - teams');
      console.log('   - team_members');
      console.log('   - participants.team_id (coluna adicionada)');
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
