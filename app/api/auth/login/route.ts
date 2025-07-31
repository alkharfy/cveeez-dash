import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, ["email", "password"])

    if (!validation.isValid) {
      return validation.error!
    }

    const { email, password } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return createApiResponse(null, error.message, undefined, 401)
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

    return createApiResponse(
      {
        user: profile,
        session: data.session,
      },
      undefined,
      "Login successful",
    )
  } catch (error) {
    return handleApiError(error)
  }
}
