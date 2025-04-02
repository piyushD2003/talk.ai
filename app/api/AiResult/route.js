import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
        const { text, history, api } = await request.json();
        // Initialize GoogleGenerativeAI with your API key.
        console.log(api);
        
        const genAI = new GoogleGenerativeAI(api);

        // Initialize a Gemini model appropriate for your use case.
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        // Start a chat session with the provided history.
        const chat = model.startChat({ history: history });
        
        // Send the text to the AI model and get a response.
        const result = await chat.sendMessage(text);
        const AiResponse = result.response.text();
        console.log(AiResponse);

        // Return the AI response.
        return new Response(JSON.stringify({ AiResponse }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ error: 'Failed to process the request.' }), { status: 500 });
    }
}
