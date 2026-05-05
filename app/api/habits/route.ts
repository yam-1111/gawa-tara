import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const logs = await prisma.habitLog.findMany({
      where: {
        userId: user.id,
      },
    })
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { taskId, date, status } = body

    if (!taskId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const log = await prisma.habitLog.upsert({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
      update: {
        status: status || "DONE",
      },
      create: {
        taskId,
        userId: user.id,
        date,
        status: status || "DONE",
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to log habit" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { taskId, date } = body

    if (!taskId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.habitLog.delete({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete habit log" }, { status: 500 })
  }
}
