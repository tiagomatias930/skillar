import { NextResponse } from "next/server"import { NextResponse } from 'next/server'import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

 import type { NextRequest } from 'next/server'import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {

  const { pathname, searchParams } = new URL(request.url) 



  // Se estiver na raiz e tiver o código de autorização, redireciona para o callbackexport function middleware(request: NextRequest) {// Add paths that don't require authentication

  if (pathname === '/' && searchParams.has('code')) {

    const code = searchParams.get('code')  const { pathname, searchParams } = new URL(request.url)const publicPaths = [

    const state = searchParams.get('state')

    return NextResponse.redirect(  "/",

      new URL(`/api/auth/callback/42?code=${code}&state=${state || ''}`, request.url)

    )  // Se estiver na raiz e tiver o código de autorização, redireciona para o callback  "/login",

  }

  if (pathname === '/' && searchParams.has('code')) {  "/api/auth/callback/42",

  return NextResponse.next()

}    const code = searchParams.get('code')  "/api/auth/login/42",



// Configurar os caminhos que o middleware deve processar    const state = searchParams.get('state')  "/api/auth/session",

export const config = {

  matcher: '/'    return NextResponse.redirect(  "/api/auth/logout"

}
      new URL(`/api/auth/callback/42?code=${code}&state=${state || ''}`, request.url)]

    )

  }export function middleware(request: NextRequest) {

  const path = request.nextUrl.pathname

  return NextResponse.next()

}  // Get session cookie

  const session = request.cookies.get("session")

// Configurar os caminhos que o middleware deve processar

export const config = {  // If user is trying to access login page and is already logged in, redirect to competitions

  matcher: '/'  if (path === "/login" && session) {

}    try {
      const sessionData = JSON.parse(session.value)
      if (sessionData.access_token && sessionData.username) {
        return NextResponse.redirect(new URL("/competitions", request.url))
      }
    } catch {
      // If session is invalid, continue to login page
    }
  }

  // Check if the path is public
  if (publicPaths.some(p => path === p || path.startsWith("/api/auth/"))) {
    return NextResponse.next()
  }

  // Check for session cookie for protected routes

  if (!session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", encodeURIComponent(path))
    return NextResponse.redirect(url)
  }

  try {
    // Validate session structure
    const sessionData = JSON.parse(session.value)
    if (!sessionData.access_token || !sessionData.username) {
      throw new Error("Invalid session")
    }
  } catch {
    // Invalid session format, redirect to login
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", encodeURIComponent(path))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}