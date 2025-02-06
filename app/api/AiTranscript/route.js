import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
    const { audio, mimeType, history, api } = await request.json();
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

    
    // const prompt = `correct the grammar mistake of following sentence, don't mention the mistake and just rewrite again: ${result.response.text()}`;
    // const result1 = await model.generateContent(prompt);

    // Send the response back to the client.
  //   const chatHistory =[
  //     { role: "user", parts: [{ text: "Hello" }],},
  //     { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }],},
  // ]
    const chat = model.startChat({history: history});
    
    const transcript = result.response.text()
    const result1 = await chat.sendMessage(result.response.text())
    const AiResponse = result1.response.text();
    console.log(AiResponse);
    
    // chatHistory.push({ role: "user", parts: [{ text: transcript }] });
    // chatHistory.push({ role: "model", parts: [{ text: AiResponse }] });
    // console.log(chatHistory);
    return new Response(JSON.stringify({ transcript: transcript, AiResponse}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process the request.' }), { status: 500 });
  }
}
