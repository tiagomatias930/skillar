// Mock data storage for teams (temporary solution while database is not configured)
export let mockTeams: any[] = [
  {
    id: '1',
    name: 'Code Masters',
    description: 'Equipa focada em algoritmos e estruturas de dados',
    total_points: 3330,
    max_members: 5,
    created_at: '2025-09-15',
    team_members: [
      { user_id: 'alice42', role: 'leader', users: { username: 'alice42', total_points: 1250 } },
      { user_id: 'bob_dev', role: 'member', users: { username: 'bob_dev', total_points: 980 } },
      { user_id: 'charlie', role: 'member', users: { username: 'charlie', total_points: 1100 } }
    ]
  },
  {
    id: '2', 
    name: 'Web Warriors',
    description: 'Especialistas em desenvolvimento web',
    total_points: 2290,
    max_members: 4,
    created_at: '2025-09-10',
    team_members: [
      { user_id: 'diana_web', role: 'leader', users: { username: 'diana_web', total_points: 1400 } },
      { user_id: 'eve_css', role: 'member', users: { username: 'eve_css', total_points: 890 } }
    ]
  }
]

export const addTeam = (team: any) => {
  mockTeams.push(team)
}

export const updateTeam = (teamId: string, updatedTeam: any) => {
  const index = mockTeams.findIndex(team => team.id === teamId)
  if (index !== -1) {
    mockTeams[index] = updatedTeam
  }
}

export const removeTeam = (teamId: string) => {
  const index = mockTeams.findIndex(team => team.id === teamId)
  if (index !== -1) {
    mockTeams.splice(index, 1)
  }
}