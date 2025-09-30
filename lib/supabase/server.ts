import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://dgcodvcofzumuauqnaif.supabase.co"!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY29kdmNvZnp1bXVhdXFuYWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDUzOTYsImV4cCI6MjA3MzM4MTM5Nn0.IbFn3jSU1ImezgSr73mCp65XW1vJe5pCBg4Tp3k_me0"!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}