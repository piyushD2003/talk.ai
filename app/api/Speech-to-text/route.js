import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
    const { audio, mimeType, api } = await request.json();
    // Initialize GoogleGenerativeAI with your API key.
    console.log(api);
    
    const genAI = new GoogleGenerativeAI(api);

    // Initialize a Gemini model appropriate for your use case.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    // Generate content using the Base64 audio data and prompt.
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: audio,
        },
      },
      
      { text: "Please transcribe the audio." },
    ]);
    console.log("Hello1", result);
    
    const transcript = result.response.text()
    
    return new Response(JSON.stringify({ transcript: transcript}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process the request.' }), { status: 500 });
  }
}
