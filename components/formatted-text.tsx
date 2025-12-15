"use client"

import React from "react"

type Props = {
  text: string
  className?: string
}

// Lightweight formatter: preserves line breaks and renders simple lists.
export function FormattedText({ text, className = "" }: Props) {
  if (!text) return null

  const blocks = text.trim().split(/\n{2,}/)

  const renderBlock = (block: string, idx: number) => {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return null

    const isUl = lines.length > 1 && lines.every(l => /^[-*•]\s+/.test(l))
    const isOl = lines.length > 1 && lines.every(l => /^\d+\.\s+/.test(l))

    if (isUl) {
      return (
        <ul key={idx} className={`list-disc list-inside space-y-1 ${className}`}>
          {lines.map((l, i) => (
            <li key={i}>{l.replace(/^[-*•]\s+/, "")}</li>
          ))}
        </ul>
      )
    }

    if (isOl) {
      return (
        <ol key={idx} className={`list-decimal list-inside space-y-1 ${className}`}>
          {lines.map((l, i) => (
            <li key={i}>{l.replace(/^\d+\.\s+/, "")}</li>
          ))}
        </ol>
      )
    }

    // Fallback: paragraph preserving single line breaks
    return (
      <p key={idx} className={`whitespace-pre-line ${className}`}>
        {block}
      </p>
    )
  }

  return <div>{blocks.map(renderBlock)}</div>
}
