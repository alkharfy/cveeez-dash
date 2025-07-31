import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, ["email", "password", "username", "name"])

    if (!validation.isValid) {
      return validation.error!
    }

    const { email, password, username, name, role = "Designer" } = validation.body

    const supabase = await createServerSupabaseClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return createApiResponse(null, authError.message, undefined, 400)
    }

    if (!authData.user) {
      return createApiResponse(null, "Failed to create user", undefined, 400)
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          name,
          role,
        },
      ])
      .select()
      .single()

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return handleApiError(userError)
    }

    return createApiResponse(
      {
        user: userData,
        session: authData.session,
      },
      undefined,
      "User registered successfully",
      201,
    )
  } catch (error) {
    return handleApiError(error)
  }
}
