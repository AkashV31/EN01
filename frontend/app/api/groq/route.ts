import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert urban planning and environmental AI assistant specializing in tree canopy optimization and heat island analysis. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: message || 'Tell me about urban heat island mitigation strategies'
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Groq API error: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI'

    return NextResponse.json({
      response: aiResponse,
      model: data.model,
      usage: data.usage
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
