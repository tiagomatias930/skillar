import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Buscar todas as equipas com seus membros
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          role,
          joined_at,
          users (
            username,
            total_points
          )
        )
      `)
      .order('total_points', { ascending: false })

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Transformar os dados para o formato esperado pelo frontend
    const formattedTeams = teams?.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      totalPoints: team.total_points || 0,
      maxMembers: team.max_members || 5,
      createdAt: team.created_at,
      members: team.team_members?.map((member: any) => ({
        id: member.user_id,
        username: member.users?.username || 'Unknown',
        points: member.users?.total_points || 0,
        role: member.role
      })) || []
    })) || []

    return NextResponse.json(formattedTeams)
  } catch (error) {
    console.error('Error in teams GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { name, description, maxMembers = 5 } = await request.json()

    // Verificar se o usuário está logado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o usuário já pertence a uma equipa
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User already belongs to a team' }, { status: 400 })
    }

    // Criar nova equipa
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        max_members: maxMembers,
        total_points: 0
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    // Adicionar o criador como líder da equipa
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: newTeam.id,
        user_id: user.id,
        role: 'leader'
      })

    if (memberError) {
      console.error('Error adding team leader:', memberError)
      return NextResponse.json({ error: 'Failed to add team leader' }, { status: 500 })
    }

    return NextResponse.json(newTeam, { status: 201 })
  } catch (error) {
    console.error('Error in teams POST route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}