"use client"

import { useEffect, useState } from 'react'

type SimplifiedProfile = {
  username: string
  displayname: string | null
  avatar: string | null
  campus: string | null
  wallet: number | null
  cursus: { name: string | null; level: number | null }[]
  skills: { name: string; level: number }[]
}

export default function IntraProfilePreview({ username }: { username: string }) {
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
  if (error) return <div className="text-red-400">{error}</div>
  if (!profile) return <div className="text-gray-300">Sem dados</div>

  const primaryCursus = profile.cursus?.[0]

  return (
    <div className="flex items-center gap-3">
      {profile.avatar && (
        <img src={profile.avatar} alt={`${profile.username} avatar`} className="w-16 h-16 rounded-full border border-[#073266] object-cover" />
      )}
      <div>
        <div className="text-white font-semibold">{profile.displayname || profile.username}</div>
        {profile.campus && <div className="text-sm text-gray-300">📍 {profile.campus}</div>}
        {primaryCursus && (
          <div className="text-sm text-gray-300">🏅 {primaryCursus.name} — Nível {primaryCursus.level?.toFixed?.(2) ?? primaryCursus.level}</div>
        )}
        {profile.wallet !== null && (
          <div className="text-sm text-gray-300">🍄 {profile.wallet} cogumelos</div>
        )}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-1 text-xs text-gray-400">Matérias: {profile.skills.slice(0,3).map(s => s.name).join(', ')}</div>
        )}
      </div>
    </div>
  )
}
