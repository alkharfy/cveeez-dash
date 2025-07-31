import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth, requireRole } from "@/lib/auth"
import { createApiResponse, handleApiError, getPaginationParams, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()
    const { limit, offset } = getPaginationParams(request)

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")

    let query = supabase
      .from("projects")
      .select(
        `
        *,
        client:client_id(id, name, email),
        team:team_id(id, name, leader:leader_id(name))
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (status) query = query.eq("status", status)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse({
      projects: data,
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
    const authResult = await requireRole(request, ["Admin", "Manager"])
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, ["name"])
    if (!validation.isValid) {
      return validation.error!
    }

    const { name, description, client_id, status = "Active", start_date, end_date, team_id } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description,
          client_id,
          status,
          start_date,
          end_date,
          team_id,
        },
      ])
      .select(`
        *,
        client:client_id(id, name, email),
        team:team_id(id, name, leader:leader_id(name))
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "Project created successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}
