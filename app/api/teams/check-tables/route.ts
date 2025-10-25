import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// Check if teams tables exist
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const results = {
      teams_table: false,
      team_members_table: false,
      participants_team_id_column: false,
      errors: [] as any[]
    }

    // Check teams table
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id")
        .limit(1)
      
      if (error) {
        results.errors.push({ table: 'teams', error: error.message, code: error.code })
      } else {
        results.teams_table = true
      }
    } catch (e: any) {
      results.errors.push({ table: 'teams', error: e.message })
    }

    // Check team_members table
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("id")
        .limit(1)
      
      if (error) {
        results.errors.push({ table: 'team_members', error: error.message, code: error.code })
      } else {
        results.team_members_table = true
      }
    } catch (e: any) {
      results.errors.push({ table: 'team_members', error: e.message })
    }

    // Check participants.team_id column
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("team_id")
        .limit(1)
      
      if (error) {
        results.errors.push({ table: 'participants.team_id', error: error.message, code: error.code })
      } else {
        results.participants_team_id_column = true
      }
    } catch (e: any) {
      results.errors.push({ table: 'participants.team_id', error: e.message })
    }

    const allTablesExist = results.teams_table && results.team_members_table && results.participants_team_id_column

    return NextResponse.json({
      status: allTablesExist ? 'OK' : 'INCOMPLETE',
      message: allTablesExist 
        ? '✅ Todas as tabelas de teams existem!' 
        : '❌ Algumas tabelas estão faltando. Execute o script SQL: /scripts/009_create_teams_tables.sql',
      details: results,
      sql_script: '/scripts/009_create_teams_tables.sql'
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Erro ao verificar tabelas',
      error: error.message
    }, { status: 500 })
  }
}
