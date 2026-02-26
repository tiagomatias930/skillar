// components/OAuthDebug.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function OAuthDebug() {
  const searchParams = useSearchParams()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')
    
    setDebugInfo({
      code: code ? `${code.substring(0, 10)}...` : null,
      error,
      state,
      fullUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }, [searchParams])

  const testCallbackAPI = async () => {
    try {
      const response = await fetch("/api/auth/callback", {
        method: "GET"
      })
      
      const result = await response.text()
      alert(`API Test Result (${response.status}): ${result}`)
    } catch (error) {
      alert(`API Test Error: ${error}`)
    }
  }

  const code = searchParams.get('code')
  
  if (!code) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded p-4 shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2">OAuth Debug Info</h3>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button 
        onClick={testCallbackAPI}
        className="mt-2 px-2 py-1 bg-blue-500 text-foreground rounded text-xs"
      >
        Test Callback API
      </button>
    </div>
  )
}