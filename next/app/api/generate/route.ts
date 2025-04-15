import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { field, context } = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

    if (!apiKey) {
      return new NextResponse("API key not found", { status: 500 })
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant that generates academic content. Generate content for the ${field} field based on the provided context.`
          },
          {
            role: "user",
            content: `Generate ${field} based on this context: ${JSON.stringify(context)}`
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error("DeepSeek API request failed")
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    })
  } catch (error) {
    console.error("Generation error:", error)
    return new NextResponse("Generation failed", { status: 500 })
  }
} 