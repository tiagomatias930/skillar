import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url") || "https://play.picoctf.org"

  try {
    // Try to perform a light connectivity check on the provided picoCTF instance
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(`${url}`, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    })
    clearTimeout(id)

    const isAccessible = response.status >= 200 && response.status < 400

    return NextResponse.json({
      instanceUrl: url,
      status: isAccessible ? "ONLINE" : "LIMITED_ACCESS",
      message: isAccessible 
        ? "Instância do picoCTF detectada e ativa na rede." 
        : "Acesso limitado à instância (CORS ou restrição de IP).",
      apiDocs: `${url}/api/v1/docs`,
      openApiSchema: `${url}/api/v1/swagger.json`,
      platform: "picoCTF",
      isCustomInstance: url !== "https://play.picoctf.org"
    })
  } catch (error) {
    return NextResponse.json({
      instanceUrl: url,
      status: "OFFLINE",
      message: "Instância inalcançável. Verifique a URL do servidor ou túneis de VPN ativos.",
      apiDocs: `${url}/api/v1/docs`,
      openApiSchema: `${url}/api/v1/swagger.json`,
      platform: "picoCTF",
      isCustomInstance: url !== "https://play.picoctf.org"
    })
  }
}
