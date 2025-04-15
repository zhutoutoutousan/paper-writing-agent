import { NextResponse } from 'next/server'
import { DeepSeek } from '@/lib/deepseek'

const deepseek = new DeepSeek()

export async function POST(request: Request) {
  try {
    const { title, abstract, keywords } = await request.json()

    if (!title || !abstract || !keywords) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = `Based on the following paper information, generate research questions, target databases, and a publication date range:

Title: ${title}
Abstract: ${abstract}
Keywords: ${keywords.join(', ')}

Please provide:
1. 3-5 research questions that would help explore this topic
2. 3-5 relevant academic databases to search
3. A reasonable publication date range for finding relevant papers

Format the response as JSON with the following structure:
{
  "researchQuestions": ["question1", "question2", ...],
  "targetDatabases": ["database1", "database2", ...],
  "publicationDateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  }
}`

    const response = await deepseek.generate(prompt)
    
    // Clean up the response by removing markdown formatting
    const cleanResponse = response
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove ```
      .trim()                      // Remove extra whitespace
    
    // Parse the cleaned response
    const generatedData = JSON.parse(cleanResponse)
    
    // Validate the response structure
    if (!generatedData.researchQuestions || !generatedData.targetDatabases || !generatedData.publicationDateRange) {
      throw new Error('Invalid response format from AI')
    }

    return NextResponse.json(generatedData)
  } catch (error) {
    console.error('Error generating research data:', error)
    return NextResponse.json(
      { error: 'Failed to generate research data' },
      { status: 500 }
    )
  }
} 