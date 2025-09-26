"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AiChallengeGenerator } from "@/components/ai-challenge-generator"
import { Navigation } from "@/components/navigation"
import { useTranslation } from "@/hooks/use-translation"

export default function CreateCompetitionPage() {
  const { t } = useTranslation()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationType, setDurationType] = useState<"dias" | "horas">("dias")
  const [durationValue, setDurationValue] = useState(1)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const username = localStorage.getItem("skillar_username")
    if (!username) {
      router.push("/login")
      return
    }

    if (!title.trim() || !description.trim()) {
      setError(t("competitions.titleRequired"))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          creatorUsername: username,
          durationType,
          durationValue,
          durationMinutes,
          customEndDate: customEndDate ? new Date(customEndDate).toISOString() : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("competitions.createError"))
      }

      router.push(`/competitions/${data.competition.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("competitions.unknownError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#06224A] to-[#052A5F]">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t("competitions.createNew")}</h1>
            <p className="text-gray-300">{t("competitions.defineDetails")}</p>
          </div>

          <AiChallengeGenerator onChallengeGenerated={(challenge) => {
            setTitle(challenge.titulo)
            setDescription(challenge.descricao)
          }} />

          <Card className="bg-[#073266] border-[#052A5F] shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">{t("competitions.competitionDetails")}</CardTitle>
              <CardDescription className="text-gray-300">{t("competitions.activeFor8Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-200">{t("competitions.competitionTitle")}</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder={t("competitions.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="bg-[#052A5F] border-[#073266] text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-200">{t("competitions.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("competitions.descriptionPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="bg-[#052A5F] border-[#073266] text-white placeholder:text-gray-400"
                  />
                </div>


                <div>
                  <Label className="text-gray-200">{t("competitions.challengeDuration")}</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <select
                      className="border rounded px-2 py-1 bg-[#052A5F] border-[#073266] text-white"
                      value={durationType}
                      onChange={e => setDurationType(e.target.value as "dias" | "horas")}
                    >
                      <option value="dias">{t("competitions.days")}</option>
                      <option value="horas">{t("competitions.hours")}</option>
                    </select>
                    <Input
                      type="number"
                      min={1}
                      max={durationType === "dias" ? 30 : 168}
                      value={durationValue}
                      onChange={e => setDurationValue(Number(e.target.value))}
                      className="w-20 bg-[#052A5F] border-[#073266] text-white"
                    />
                    <span className="text-gray-200">{durationType === "dias" ? t("competitions.days") : t("competitions.hours")}</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-20 bg-[#052A5F] border-[#073266] text-white"
                    />
                    <span className="text-gray-200">{t("competitions.minutes")}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t("competitions.durationHelper")}</p>
                </div>

                <div>
                  <Label htmlFor="customEndDate" className="text-gray-200">{t("competitions.customEndDate")}</Label>
                  <Input
                    id="customEndDate"
                    type="datetime-local"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="w-64 bg-[#052A5F] border-[#073266] text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t("competitions.endDateHelper")}</p>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 border-[#073266] text-gray-300 hover:bg-[#052A5F] hover:text-white">
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 bg-[#052A5F] hover:bg-[#073266] text-white">
                    {isLoading ? t("competitions.creating") : t("competitions.createCompetition")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
