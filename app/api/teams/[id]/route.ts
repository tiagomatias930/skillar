import { NextRequest, NextResponse } from 'next/server'
import { mockTeams, updateTeam, removeTeam } from '@/lib/mock-teams'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Verificar se o usuário já pertence a uma equipa
    const existingMember = mockTeams.find(team => 
      team.team_members.some((member: any) => member.user_id === username)
    )

    if (existingMember) {
      return NextResponse.json({ error: 'User already belongs to a team' }, { status: 400 })
    }

    // Encontrar a equipa
    const team = mockTeams.find(team => team.id === teamId)
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.team_members.length >= team.max_members) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 })
    }

    // Adicionar o usuário à equipa
    const updatedTeam = {
      ...team,
      team_members: [
        ...team.team_members,
        {
          user_id: username,
          role: 'member',
          users: {
            username: username,
            total_points: 0
          }
        }
      ]
    }

    updateTeam(teamId, updatedTeam)

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
    const teamId = params.id
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Encontrar a equipa
    const team = mockTeams.find(team => team.id === teamId)
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Remover o usuário da equipa
    const updatedMembers = team.team_members.filter((member: any) => member.user_id !== username)

    // Se não restam membros, remover a equipa
    if (updatedMembers.length === 0) {
      removeTeam(teamId)
    } else {
      const updatedTeam = {
        ...team,
        team_members: updatedMembers
      }
      updateTeam(teamId, updatedTeam)
    }

    return NextResponse.json({ message: 'Successfully left team' })
  } catch (error) {
    console.error('Error in leave team route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}