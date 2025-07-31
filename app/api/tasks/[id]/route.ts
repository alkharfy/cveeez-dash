import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_user:assigned_to(id, name, email),
        created_user:created_by(id, name, email),
        project:project_id(id, name),
        comments(
          id,
          content,
          created_at,
          user:user_id(id, name, email)
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
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, [])
    if (!validation.isValid) {
      return validation.error!
    }

    const { title, description, status, priority, due_date, estimated_hours, assigned_to, project_id } = validation.body

    const supabase = await createServerSupabaseClient()

    const updateData: any = { updated_at: new Date().toISOString() }

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (due_date !== undefined) updateData.due_date = due_date
    if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (project_id !== undefined) updateData.project_id = project_id

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        assigned_user:assigned_to(id, name, email),
        created_user:created_by(id, name, email),
        project:project_id(id, name)
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "Task updated successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("tasks").delete().eq("id", params.id)

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(null, undefined, "Task deleted successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
