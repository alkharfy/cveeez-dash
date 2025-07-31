import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth, requireRole } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        client:client_id(id, name, email),
        team:team_id(
          id,
          name,
          leader:leader_id(id, name),
          members:team_members(
            user:user_id(id, name, email, role)
          )
        ),
        tasks(
          id,
          title,
          status,
          priority,
          assigned_to,
          assigned_user:assigned_to(name)
        )
      `)
      .eq("id", params.id)
      .single()

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
    const authResult = await requireRole(request, ["Admin", "Manager"])
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, [])
    if (!validation.isValid) {
      return validation.error!
    }

    const { name, description, client_id, status, start_date, end_date, team_id } = validation.body

    const supabase = await createServerSupabaseClient()

    const updateData: any = { updated_at: new Date().toISOString() }

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (client_id !== undefined) updateData.client_id = client_id
    if (status) updateData.status = status
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (team_id !== undefined) updateData.team_id = team_id

    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        client:client_id(id, name, email),
        team:team_id(id, name, leader:leader_id(name))
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "Project updated successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireRole(request, ["Admin"])
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("projects").delete().eq("id", params.id)

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(null, undefined, "Project deleted successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
