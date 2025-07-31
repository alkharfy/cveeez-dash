import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireRole } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireRole(request, ["Admin", "Manager"])
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, ["user_id"])
    if (!validation.isValid) {
      return validation.error!
    }

    const { user_id } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          team_id: params.id,
          user_id,
        },
      ])
      .select(`
        *,
        user:user_id(id, name, email, role)
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "User added to team successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireRole(request, ["Admin", "Manager"])
    if (authResult instanceof Response) return authResult

    const url = new URL(request.url)
    const userId = url.searchParams.get("user_id")

    if (!userId) {
      return createApiResponse(null, "user_id parameter is required", undefined, 400)
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("team_members").delete().eq("team_id", params.id).eq("user_id", userId)

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(null, undefined, "User removed from team successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
