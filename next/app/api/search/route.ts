import { NextResponse } from "next/server"
import { SearchService } from "@/lib/search-service"

const searchService = SearchService.getInstance()

export async function POST(request: Request) {
  try {
    const { researchQuestions, targetDatabases, publicationDateRange } = await request.json()

    if (!researchQuestions || !targetDatabases || !publicationDateRange) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const results = await searchService.search(
      researchQuestions,
      targetDatabases,
      {
        start: new Date(publicationDateRange.start),
        end: new Date(publicationDateRange.end)
      }
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
} 