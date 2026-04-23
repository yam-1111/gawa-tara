import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateSchedule } from "@/lib/scheduler"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
        isComplete: false,
        priority: { not: 'DELETE' }
      }
    })

    const newBlocks = generateSchedule(tasks, user.id)

    // Transaction to clear old planned blocks and insert new ones
    await prisma.$transaction([
      prisma.scheduleBlock.deleteMany({
        where: {
          userId: user.id,
          status: 'PLANNED'
        }
      }),
      prisma.scheduleBlock.createMany({
        data: newBlocks.map(block => ({
          startTime: block.startTime!,
          endTime: block.endTime!,
          status: 'PLANNED',
          taskId: block.taskId!,
          userId: user.id
        }))
      })
    ])

    return NextResponse.json({ success: true, count: newBlocks.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to generate schedule" }, { status: 500 })
  }
}
