import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth } from "@/lib/auth"
import { createApiResponse, handleApiError, getPaginationParams, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()
    const { limit, offset } = getPaginationParams(request)

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")
    const assignedTo = url.searchParams.get("assigned_to")
    const projectId = url.searchParams.get("project_id")
    const search = url.searchParams.get("search")

    let query = supabase
      .from("tasks")
      .select(
        `
        *,
        assigned_user:assigned_to(id, name, email),
        created_user:created_by(id, name, email),
        project:project_id(id, name)
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (status) query = query.eq("status", status)
    if (priority) query = query.eq("priority", priority)
    if (assignedTo) query = query.eq("assigned_to", assignedTo)
    if (projectId) query = query.eq("project_id", projectId)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse({
      tasks: data,
      pagination: {
        total: count,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, ["title"])
    if (!validation.isValid) {
      return validation.error!
    }

    const {
      title,
      description,
      status = "Pending",
      priority = "Medium",
      due_date,
      estimated_hours,
      assigned_to,
      project_id,
    } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description,
          status,
          priority,
          due_date,
          estimated_hours,
          assigned_to,
          project_id,
          created_by: authResult.id,
        },
      ])
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

    return createApiResponse(data, undefined, "Task created successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}
