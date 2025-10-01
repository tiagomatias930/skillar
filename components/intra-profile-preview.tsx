"use client"

import { useEffect, useState } from 'react'

type SimplifiedProfile = {
  username: string
  displayname: string | null
  avatar: string | null
  campus: any
  wallet: number | null
  cursus: { name: string | null; level: number | null }[]
  skills: { name: string; level: number }[]
  coalitions?: any[]
  locations?: any[]
}

export default function IntraProfilePreview({ username, avatarUrl }: { username: string; avatarUrl?: string | null }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<SimplifiedProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetch(`/api/intra/profile/${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return
        if (json.success) setProfile(json.profile)
        else setError(json.error || 'Erro ao carregar perfil')
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.message)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => { mounted = false }
  }, [username])

  if (loading) return <div className="text-gray-300">A carregar...</div>
  // If API errored, fallback to minimal display using avatarUrl
  if (error) {
    return (
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${username} avatar`} className="w-16 h-16 rounded-full border border-[#073266] object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#052A5F] flex items-center justify-center text-white">{username?.[0]?.toUpperCase() || '?'}</div>
        )}
        <div>
          <div className="text-white font-semibold">{username}</div>
          <div className="text-sm text-gray-300">Dados públicos indisponíveis</div>
        </div>
      </div>
    )
  }

  if (!profile) return <div className="text-gray-300">Sem dados</div>

  const primaryCursus = profile.cursus?.[0]
  const coal = profile.coalitions?.slice?.(0,2) || []
  const locs = profile.locations || []

  return (
    <div className="flex items-center gap-3">
      {profile.avatar && (
        <img src={profile.avatar} alt={`${profile.username} avatar`} className="w-16 h-16 rounded-full border border-[#073266] object-cover" />
      )}
      <div>
        <div className="text-white font-semibold">{profile.displayname || profile.username}</div>
        {profile.campus && <div className="text-sm text-gray-300">📍 {typeof profile.campus === 'string' ? profile.campus : profile.campus.name}</div>}
        {primaryCursus && (
          <div className="text-sm text-gray-300">🏅 {primaryCursus.name} — Nível {primaryCursus.level?.toFixed?.(2) ?? primaryCursus.level}</div>
        )}
        {profile.wallet !== null && (
          <div className="text-sm text-gray-300">🍄 {profile.wallet} cogumelos</div>
        )}
        {coal.length > 0 && (
          <div className="text-sm text-gray-300">Coalitions: {coal.map((c:any) => c.name).join(', ')}</div>
        )}
        {locs.length > 0 && (
          <div className="text-sm text-gray-300">Localizações recentes: {locs.map((l:any)=> l.host || l.campus_id).slice(0,3).join(', ')}</div>
        )}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-1 text-xs text-gray-400">Matérias: {profile.skills.slice(0,3).map(s => s.name).join(', ')}</div>
        )}
      </div>
    </div>
  )
}
