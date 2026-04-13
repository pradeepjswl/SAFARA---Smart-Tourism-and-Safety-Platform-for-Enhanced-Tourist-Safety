import OpenAI from 'openai';

// Initialize the OpenAI instance
// If OPENAI_API_KEY is not defined, openai throws an error immediately on initialization, so we catch it.
let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn("OpenAI API key not configured. Chatbot will return mock responses.");
}

export async function processChatMessage(userId: string, prompt: string): Promise<string> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    // Return a mock customized response while API keys are missing
    return `[Mock Response] I am Safara's Eco-Travel Assistant! I see you are asking: "${prompt}". Please add your OPENAI_API_KEY to the backend .env to get actual AI-generated responses!`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for the Safara travel app. You provide eco-friendly and sustainable travel tips, customized itineraries, and answer questions accurately. Be friendly and concise.',
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at this time.";
  } catch (error: any) {
    console.error("OpenAI Error:", error.message);
    throw Object.assign(new Error("Failed to generate response from Chatbot"), { status: 500 });
  }
}
