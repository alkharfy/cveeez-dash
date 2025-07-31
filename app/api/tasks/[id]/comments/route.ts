import type { NextRequest } from "next/server"
import { createServerSupabaseClient, requireAuth } from "@/lib/auth"
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `)
      .eq("task_id", params.id)
      .order("created_at", { ascending: true })

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const validation = await validateRequestBody(request, ["content"])
    if (!validation.isValid) {
      return validation.error!
    }

    const { content } = validation.body

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          task_id: params.id,
          user_id: authResult.id,
          content,
        },
      ])
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `)
      .single()

    if (error) {
      return handleApiError(error)
    }

    return createApiResponse(data, undefined, "Comment added successfully", 201)
  } catch (error) {
    return handleApiError(error)
  }
}
