import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
    await prisma.user.delete({ where: { id: authUser.id } })

    // 3. Delete from Supabase Auth
    const adminSupabase = createAdminClient()
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(authUser.id)
    if (authError) {
      console.error("Auth delete error:", authError)
      // If service role key is missing, this will fail. 
      // We throw to ensure the user knows it failed.
      throw new Error("Failed to delete user from Supabase Auth. Ensure SUPABASE_SERVICE_ROLE_KEY is set.")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
