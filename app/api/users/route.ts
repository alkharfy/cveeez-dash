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
    const role = url.searchParams.get("role")
    const search = url.searchParams.get("search")

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (role) {
      query = query.eq("role", role)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse({
      users: data,
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

    const validation = await validateRequestBody(request, ["email", "username", "name"])

    if (!validation.isValid) {
      return validation.error!
    }

    const { email, username, name, role = "Designer", avatar_url } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          username,
          name,
          role,
          avatar_url,
        },
      ])
      .select()
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "User created successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}
