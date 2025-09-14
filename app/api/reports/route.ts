import { type NextRequest, NextResponse } from "next/server"
import { createReport, getReports } from "@/lib/database"

export async function GET() {
  try {
    const reports = await getReports()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reportedUsername, reporterUsername, reason } = await request.json()

    if (!reportedUsername || !reporterUsername || !reason) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (reportedUsername === reporterUsername) {
      return NextResponse.json({ error: "Você não pode reportar a si mesmo" }, { status: 400 })
    }

    const success = await createReport(reportedUsername, reporterUsername, reason)

    if (!success) {
      return NextResponse.json({ error: "Erro ao criar relatório" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
