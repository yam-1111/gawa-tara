import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
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
    const { name, description, dueDate, duration, priority, recurrence, interval, recurrenceDays, recurrenceEnd, tags } = body

    if (!name || !priority || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        duration,
        priority,
        recurrence: recurrence || "NONE",
        interval: interval || 1,
        recurrenceDays: recurrenceDays || [],
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        userId: user.id,
        tags: {
          create: tags?.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          })) || []
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
