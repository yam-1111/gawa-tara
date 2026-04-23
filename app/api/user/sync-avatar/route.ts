import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const avatarUrl = authUser.user_metadata.avatar_url
    if (!avatarUrl) {
      return NextResponse.json({ error: "No avatar URL found in metadata" }, { status: 400 })
    }

    // 1. Download image
    const response = await fetch(avatarUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    // 2. Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.find(b => b.name === 'profile_picture')
    
    if (!bucketExists) {
      await supabase.storage.createBucket('profile_picture', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png']
      })
    }

    // 3. Upload to bucket
    const fileName = `user-${authUser.id}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('profile_picture')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile_picture')
      .getPublicUrl(fileName)

    // 5. Update DB
    const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        userPicture: publicUrl,
        username: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User'
      },
      create: {
        id: authUser.id,
        email: authUser.email!,
        googleOAuth: authUser.id,
        username: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User',
        userPicture: publicUrl
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to sync avatar" }, { status: 500 })
  }
}
