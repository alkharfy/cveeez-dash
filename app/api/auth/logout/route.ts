import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return createApiResponse(null, error.message, undefined, 400)
    }

    return createApiResponse(null, undefined, "Logout successful")
  } catch (error) {
    return handleApiError(error)
  }
}
