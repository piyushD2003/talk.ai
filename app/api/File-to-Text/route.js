import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINIAPIKEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const { data, mimeType } = await request.json();

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: path,
        mimeType : mimeType
      },
    };
  }
  const text = fileToGenerativePart(data,mimeType)
  const generatedContent = await model.generateContent([
    "Can you summarize this document as a bulleted list and also personal details?",
    [text]
  ])
  const FileTranscript=generatedContent.response.text()
  
  return new Response(JSON.stringify({text:FileTranscript}), {
    headers: { 'Content-Type': 'application/json' },
  });
  
};


