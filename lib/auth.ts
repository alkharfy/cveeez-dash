import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function getUser() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile from our users table
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return profile
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return user
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = await requireAuth(request)

  if (user instanceof NextResponse) {
    return user // Return the error response
  }

  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
  }

  return { user, profile }
}
