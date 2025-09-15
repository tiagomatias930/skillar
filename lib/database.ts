import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export interface User {
  id: string
  username: string
  created_at: string
}

export interface Competition {
  id: string
  title: string
  description: string
  creator_id: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  duration_type?: "dias" | "horas"
  duration_value?: number
  duration_minutes?: number
  custom_end_date?: string
  creator?: User
}

export interface Participant {
  id: string
  competition_id: string
  user_id: string
  points: number
  joined_at: string
  user?: User
}

export interface Report {
  id: string
  reported_user_id: string
  reporter_user_id: string
  reason: string
  created_at: string
  reported_user?: User
  reporter_user?: User
}

export interface CompetitionHistory {
  id: string
  competition_id: string
  winner_id: string
  final_points: number
  ended_at: string
  winner?: User
  competition?: Competition
}

// Set current user context for RLS policies
export async function setCurrentUser(username: string) {
  // For now, we'll skip the RLS context setting since we disabled RLS
  console.log("[v0] Setting current user context:", username)
}

// User functions
export async function createUser(username: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("users").insert({ username }).select().single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error) return null
  return data
}

// Competition functions
export async function getActiveCompetitions(): Promise<Competition[]> {
  console.log("[v0] Fetching active competitions")

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("competitions")
    .select("*, creator:users!competitions_creator_id_fkey(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching competitions:", error)
    return []
  }

  console.log("[v0] Fetched competitions:", data?.length || 0)
  return data || []
}

export async function createCompetition(
  title: string,
  description: string,
  creatorUsername: string,
  durationType?: "dias" | "horas",
  durationValue?: number,
  durationMinutes?: number,
  customEndDate?: Date,
): Promise<Competition | null> {
  const supabase = await createClient()

  // Get creator user
  const creator = await getUserByUsername(creatorUsername)
  if (!creator) return null

  await setCurrentUser(creatorUsername)

  const { data, error } = await supabase
    .from("competitions")
    .insert({
      title,
      description,
      creator_id: creator.id,
      duration_type: durationType,
      duration_value: durationValue,
      duration_minutes: durationMinutes,
      custom_end_date: customEndDate ? customEndDate.toISOString() : null,
     })
     .select("*, creator:users!competitions_creator_id_fkey(*)")
     .single()

  if (error) {
    console.error("Error creating competition:", error)
    return null
  }

  return data
}

// Participant functions
export async function joinCompetition(competitionId: string, username: string): Promise<boolean> {
  console.log("[v0] Attempting to join competition:", { competitionId, username })

  const supabase = await createClient()

  const user = await getUserByUsername(username)
  if (!user) {
    console.log("[v0] User not found:", username)
    return false
  }

  console.log("[v0] User found:", user)

  const { data, error } = await supabase
    .from("participants")
    .insert({
      competition_id: competitionId,
      user_id: user.id,
    })
    .select()

  if (error) {
    console.error("[v0] Error joining competition:", error)
    return false
  }

  console.log("[v0] Successfully joined competition:", data)
  return true
}

export async function getCompetitionRanking(competitionId: string): Promise<Participant[]> {
  console.log("[v0] getCompetitionRanking called with competitionId:", competitionId)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("participants")
    .select("*, user:users!participants_user_id_fkey(*)")
    .eq("competition_id", competitionId)
    .order("points", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching ranking:", error)
    return []
  }

  console.log("[v0] Raw ranking data:", data)
  console.log("[v0] Number of participants found:", data?.length || 0)

  data?.forEach((participant, index) => {
    console.log(`[v0] Participant ${index + 1}:`, {
      id: participant.id,
      username: participant.user?.username,
      points: participant.points,
      pointsType: typeof participant.points,
    })
  })

  return data || []
}

export async function updateParticipantPoints(
  participantId: string,
  points: number,
  creatorUsername: string,
): Promise<boolean> {
  console.log("[v0] updateParticipantPoints called with:", { participantId, points, creatorUsername })

  const supabase = await createClient()

  await setCurrentUser(creatorUsername)

  const { data: existingParticipant, error: checkError } = await supabase
    .from("participants")
    .select("*, competition:competitions!participants_competition_id_fkey(*)")
    .eq("id", participantId)
    .single()

  if (checkError) {
    console.error("[v0] Error checking participant existence:", checkError)
    return false
  }

  console.log("[v0] Existing participant found:", existingParticipant)

  const creator = await getUserByUsername(creatorUsername)
  if (!creator) {
    console.error("[v0] Creator not found:", creatorUsername)
    return false
  }

  if (existingParticipant.competition?.creator_id !== creator.id) {
    console.error("[v0] Creator does not have permission to update this competition")
    return false
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await serviceSupabase
    .from("participants")
    .update({ points })
    .eq("id", participantId)
    .select("*")

  if (error) {
    console.error("[v0] Error updating participant points:", error)
    return false
  }

  console.log("[v0] Update query result:", data)

  if (!data || data.length === 0) {
    console.error("[v0] Update returned no data - participant may not exist or RLS policy blocked the update")

    const { data: checkData, error: checkError2 } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .single()

    if (checkError2) {
      console.error("[v0] Participant no longer exists:", checkError2)
    } else {
      console.log("[v0] Participant still exists after failed update:", checkData)
    }

    return false
  }

  const updatedParticipant = data[0]
  console.log("[v0] Successfully updated participant:", updatedParticipant)

  if (updatedParticipant.points !== points) {
    console.error("[v0] Points were not updated correctly. Expected:", points, "Got:", updatedParticipant.points)
    return false
  }

  console.log("[v0] Update result: true")
  return true
}

// Report functions
export async function createReport(
  reportedUsername: string,
  reporterUsername: string,
  reason: string,
): Promise<boolean> {
  const supabase = await createClient()

  const reportedUser = await getUserByUsername(reportedUsername)
  const reporterUser = await getUserByUsername(reporterUsername)

  if (!reportedUser || !reporterUser) return false

  const { error } = await supabase.from("reports").insert({
    reported_user_id: reportedUser.id,
    reporter_user_id: reporterUser.id,
    reason,
  })

  return !error
}

export async function getReports(): Promise<Report[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reports")
    .select("*, reported_user:users!reports_reported_user_id_fkey(*), reporter_user:users!reports_reporter_user_id_fkey(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    return []
  }

  return data || []
}

// Competition history functions
export async function getCompetitionHistory(): Promise<CompetitionHistory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("competition_history")
    .select("*, winner:users!competition_history_winner_id_fkey(*), competition:competitions!competition_history_competition_id_fkey(*)")
    .order("ended_at", { ascending: false })

  if (error) {
    console.error("Error fetching history:", error)
    return []
  }

  return data || []
}

// Blacklist functions
export async function addToBlacklist(username: string, reason?: string): Promise<boolean> {
  const supabase = await createClient()

  const user = await getUserByUsername(username)
  if (!user) return false

  const { error } = await supabase.from("blacklist").insert({
    user_id: user.id,
    reason: reason || "Violação das regras da comunidade",
  })

  return !error
}

export async function isUserBlacklisted(username: string): Promise<boolean> {
  const supabase = await createClient()

  const user = await getUserByUsername(username)
  if (!user) return false

  const { data, error } = await supabase.from("blacklist").select("id").eq("user_id", user.id).single()

  return !error && !!data
}

export async function getBlacklist(): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blacklist")
    .select("*, user:users!blacklist_user_id_fkey(*)")
    .order("blacklisted_at", { ascending: false })

  if (error) {
    console.error("Error fetching blacklist:", error)
    return []
  }

  return data || []
}
