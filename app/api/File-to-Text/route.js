import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  const { data, mimeType, api } = await request.json();
  const genAI = new GoogleGenerativeAI(api);
  const model = genAI.getGenerativeModel({ model: "gemini-exp-1114" });

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
  
  return new Response(JSON.stringify(FileTranscript), {
    headers: { 'Content-Type': 'application/json' },
  });
  
};


