import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth, requireRole } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", params.id).eq("is_active", true).single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, [])
    if (!validation.isValid) {
      return validation.error!
    }

    const { name, username, role, avatar_url, is_active } = validation.body

    const supabase = await createServerSupabaseClient()

    // Check if user can update this profile
    const { data: currentUser } = await supabase.from("users").select("role").eq("id", authResult.id).single()

    const isOwnProfile = authResult.id === params.id
    const isAdmin = currentUser?.role === "Admin"

    if (!isOwnProfile && !isAdmin) {
      return createApiResponse(null, "Forbidden: Cannot update other users", undefined, 403)
    }

    // Non-admins cannot change roles or active status
    const updateData: any = { name, username, avatar_url, updated_at: new Date().toISOString() }

    if (isAdmin) {
      if (role) updateData.role = role
      if (typeof is_active === "boolean") updateData.is_active = is_active
    }

    const { data, error } = await supabase.from("users").update(updateData).eq("id", params.id).select().single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "User updated successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireRole(request, ["Admin"])
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from("users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "User deactivated successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
