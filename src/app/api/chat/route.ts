import { NextRequest, NextResponse } from 'next/server'

// Define types for better TypeScript support
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 1000, systemPrompt } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      )
    }

    // Check if ZAI API key is configured
    const zaiApiKey = process.env.ZAI_API_KEY
    
    if (!zaiApiKey) {
      // Fallback response when ZAI is not configured
      return NextResponse.json({
        content: "Hello! I'm your AI assistant. Since the ZAI API is not configured, I'm providing this sample response. To enable full functionality, please configure your ZAI API key in the environment variables.",
        role: 'assistant'
      })
    }

    // Dynamic import to avoid issues when ZAI is not configured
    let ZAI
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default
    } catch (importError) {
      // Log the error for debugging but don't expose internal details to the client
      console.error('Failed to import ZAI SDK:', importError)
      return NextResponse.json({
        content: "Hello! I'm your AI assistant. There was an issue connecting to the AI service. Please check your configuration or try again later.",
        role: 'assistant'
      })
    }

    // Create ZAI instance
    const zai = await ZAI.create()
    
    // Prepare messages for the AI
    const aiMessages: Message[] = []
    
    // Add system prompt if provided
    if (systemPrompt) {
      aiMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }

    // Add conversation messages
    aiMessages.push(...messages.map((msg: Message) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    })))

    // Create the completion without streaming first to get the response
    const completion = await zai.chat.completions.create({
      messages: aiMessages,
      temperature,
      max_tokens: maxTokens,
      model,
      stream: false // Disable streaming for now to handle the response properly
    })

    // Get the response content
    const responseContent = completion.choices[0]?.message?.content || ''

    // Return the response
    return NextResponse.json({
      content: responseContent,
      role: 'assistant'
    })

  } catch (error) {
    // Log the error for debugging but don't expose internal details to the client
    console.error('Chat API error:', error)
    
    // Don't send internal error details to the client for security reasons
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        content: "I apologize, but I encountered an error processing your request. This could be due to a misconfiguration or temporary service issue. Please try again later.",
        role: 'assistant'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}