import { NextRequest, NextResponse } from 'next/server'
import { mockTeams, addTeam } from '@/lib/mock-teams'

export async function GET() {
  try {
    // Transformar os dados para o formato esperado pelo frontend
    const formattedTeams = mockTeams.map(team => ({
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
    }))

    return NextResponse.json(formattedTeams)
  } catch (error) {
    console.error('Error in teams GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, maxMembers = 5, username } = await request.json()

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

    // Criar nova equipa
    const newTeam = {
      id: Date.now().toString(),
      name,
      description,
      total_points: 0,
      max_members: maxMembers,
      created_at: new Date().toISOString().split('T')[0],
      team_members: [
        {
          user_id: username,
          role: 'leader',
          users: {
            username: username,
            total_points: 0
          }
        }
      ]
    }

    addTeam(newTeam)

    return NextResponse.json(newTeam, { status: 201 })
  } catch (error) {
    console.error('Error in teams POST route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}