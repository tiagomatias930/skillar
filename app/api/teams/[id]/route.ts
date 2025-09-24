import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const teamId = params.id

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

    // Verificar se a equipa existe e tem vagas disponíveis
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*, team_members(*)')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.team_members.length >= team.max_members) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 })
    }

    // Adicionar o usuário à equipa
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'member'
      })

    if (memberError) {
      console.error('Error joining team:', memberError)
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Successfully joined team' })
  } catch (error) {
    console.error('Error in join team route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const teamId = params.id

    // Verificar se o usuário está logado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remover o usuário da equipa
    const { error: memberError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Error leaving team:', memberError)
      return NextResponse.json({ error: 'Failed to leave team' }, { status: 500 })
    }

    // Verificar se não restam membros na equipa e deletá-la se necessário
    const { data: remainingMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)

    if (!remainingMembers || remainingMembers.length === 0) {
      await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
    }

    return NextResponse.json({ message: 'Successfully left team' })
  } catch (error) {
    console.error('Error in leave team route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}