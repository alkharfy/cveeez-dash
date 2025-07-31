import { type NextRequest, NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(
  data?: T,
  error?: string,
  message?: string,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      error,
      message,
    },
    { status },
  )
}

export async function handleApiError(error: any): Promise<NextResponse> {
  console.error("API Error:", error)

  if (error.code === "PGRST116") {
    return createApiResponse(null, "Resource not found", undefined, 404)
  }

  if (error.code === "23505") {
    return createApiResponse(null, "Resource already exists", undefined, 409)
  }

  return createApiResponse(null, error.message || "Internal server error", undefined, 500)
}

export async function validateRequestBody(
  request: NextRequest,
  requiredFields: string[],
): Promise<{ isValid: boolean; body?: any; error?: NextResponse }> {
  try {
    const body = await request.json()

    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: createApiResponse(null, `Missing required fields: ${missingFields.join(", ")}`, undefined, 400),
      }
    }

    return { isValid: true, body }
  } catch (error) {
    return {
      isValid: false,
      error: createApiResponse(null, "Invalid JSON body", undefined, 400),
    }
  }
}

export function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const offset = (page - 1) * limit

  return { page, limit, offset }
}
