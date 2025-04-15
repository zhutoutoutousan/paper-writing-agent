export class DeepSeek {
  private apiKey: string
  private baseUrl = 'https://api.deepseek.com/v1'

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_DEEPSEEK_API_KEY is not set in environment variables')
    }
    this.apiKey = apiKey
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide responses in valid JSON format without any markdown formatting or additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      
      // Log the raw response for debugging
      console.log('Raw AI response:', content)
      
      return content
    } catch (error) {
      console.error('Error calling DeepSeek API:', error)
      throw error
    }
  }
} 