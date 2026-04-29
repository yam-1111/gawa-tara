import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { energy, focus, stress, date } = body

    if (energy === undefined || focus === undefined || stress === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const checkin = await prisma.dailyCheckin.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date
        }
      },
      update: {
        energy,
        focus,
        stress
      },
      create: {
        userId: user.id,
        date,
        energy,
        focus,
        stress
      }
    })

    return NextResponse.json(checkin)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save checkin" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  try {
    const checkin = await prisma.dailyCheckin.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: date
        }
      }
    })

    return NextResponse.json(checkin || { energy: null, focus: null, stress: null })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch checkin" }, { status: 500 })
  }
}
