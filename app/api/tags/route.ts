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
    const tags = await prisma.tag.findMany({
      where: { userId: user.id }
    })
    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
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
    const { name, color } = body

    if (!name || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        userId: user.id
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}
