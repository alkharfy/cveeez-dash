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
    const search = url.searchParams.get("search")

    let query = supabase
      .from("teams")
      .select(
        `
        *,
        leader:leader_id(id, name, email),
        members:team_members(
          id,
          joined_at,
          user:user_id(id, name, email, role)
        )
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse({
      teams: data,
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

    const { name, description, leader_id } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("teams")
      .insert([
        {
          name,
          description,
          leader_id,
        },
      ])
      .select(`
        *,
        leader:leader_id(id, name, email)
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "Team created successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}
