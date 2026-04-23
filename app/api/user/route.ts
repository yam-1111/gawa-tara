import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    if (!user) {
      // Auto-provision user if they exist in Auth but not in DB
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          username: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User',
          userPicture: authUser.user_metadata.avatar_url || null,
          googleOAuth: authUser.id
        },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("User API error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { username, userPicture } = body

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        username,
        userPicture
      }
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Delete profile image from bucket
    const fileName = `user-${authUser.id}.jpg`
    await supabase.storage.from('profile_picture').remove([fileName])

    // 2. Cascade delete from DB
    // Prisma handles relations if configured, but let's be explicit if needed.
    // Based on the schema, Task, ScheduleBlock, and Tag all relate to User.
    // TaskTag relates to Task and Tag.
    
    await prisma.$transaction([
      prisma.scheduleBlock.deleteMany({ where: { userId: authUser.id } }),
      prisma.taskTag.deleteMany({ where: { task: { userId: authUser.id } } }),
      prisma.task.deleteMany({ where: { userId: authUser.id } }),
      prisma.tag.deleteMany({ where: { userId: authUser.id } }),
      prisma.user.delete({ where: { id: authUser.id } })
    ])

    // 3. Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(authUser.id)
    if (error) {
      console.error("Auth delete error:", error)
      // We still return success as DB is cleared
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
