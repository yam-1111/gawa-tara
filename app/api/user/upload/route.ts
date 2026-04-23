import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // 1. Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.find(b => b.name === 'profile_picture')
    
    if (!bucketExists) {
      await supabase.storage.createBucket('profile_picture', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png']
      })
    }

    // 2. Upload to bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `user-${authUser.id}.${fileExt}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('profile_picture')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) throw uploadError

    // 3. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile_picture')
      .getPublicUrl(fileName)

    // 4. Update Prisma DB
    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: { userPicture: publicUrl }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
