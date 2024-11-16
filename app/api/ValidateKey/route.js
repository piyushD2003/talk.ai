import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
        const {key} = await request.json()
        // console.log(key);
        const genAI = new GoogleGenerativeAI(key);
        // console.log(key);
        const model = genAI.getGenerativeModel({ model: "gemini-exp-1114" });
        // console.log(key);
        
        const result = await model.generateContent("Write a just 'True'");
        console.log(key);
        // console.log(result.response.text())
        const text = result.response.text();
        return new Response(JSON.stringify(text),{
          headers: { 'Content-Type': 'application/json' },
        })
        
    }
    catch(error) {
      console.error('Error processing request:', error);
      return new Response(JSON.stringify({ error: 'Failed to process the request.' }), { status: 500 });
    }
}