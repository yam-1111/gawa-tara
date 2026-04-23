import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateSchedule } from "@/lib/scheduler"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id, isDeleted: false, isComplete: false },
    })
    
    const blocks = generateSchedule(tasks, user.id)
    return NextResponse.json(blocks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate schedule" }, { status: 500 })
  }
}
