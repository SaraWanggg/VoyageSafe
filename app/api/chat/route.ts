import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSafetyData, processSafetyInfo } from '@/utils/safety';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages format');
    }

    const lastMessage = messages[messages.length - 1].content;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-002" });

    // Format history for Gemini
    const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      history: formattedHistory,
    });

    // Process location-specific queries
    const locationMatch = lastMessage.match(/travel to ([a-zA-Z\s]+)/i);
    let safetyInfo = "";
    let processedSafety = null;

    if (locationMatch) {
      try {
        const location = locationMatch[1];
        const safetyData = await getSafetyData(location);
        processedSafety = await processSafetyInfo(safetyData);
        safetyInfo = formatSafetyInfo(location, processedSafety);
      } catch (error) {
        console.error('Safety data error:', error);
        // Continue without safety data if there's an error
      }
    }

    // Get response from Gemini
    const response = await chat.sendMessage(lastMessage);
    let responseText = await response.response.text();

    // Combine response with safety info if available
    if (safetyInfo) {
      responseText += '\n\n' + safetyInfo;
    }

    return new Response(JSON.stringify({ 
      response: responseText,
      safetyData: processedSafety 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Helper function to format safety info
function formatSafetyInfo(location: string, safety: any) {
  if (!safety) return '';
  
  return `
    🔒 Safety Information for ${location}:
    
    Women's Safety Score: ${safety.womenSafety.score}/10
    
    Safe Areas:
    ${safety.womenSafety.safeAreas.map((area: string) => `• ${area}`).join('\n')}
    
    Safety Recommendations:
    ${safety.womenSafety.recommendations.map((rec: string) => `• ${rec}`).join('\n')}
    
    Transportation Safety:
    ${safety.transportSafety.recommendedServices.map((service: string) => `• ${service}`).join('\n')}
    
    Emergency Contacts:
    ${Object.entries(safety.womenSafety.emergencyContacts)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n')}
  `;
} 