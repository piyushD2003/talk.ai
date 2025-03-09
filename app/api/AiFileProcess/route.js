import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    const { data, task, mimeType,api } = await request.json();
    // const arr = mimeType.split("/")
    // console.log(arr);
    try {
        const genAI = new GoogleGenerativeAI(api);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        function fileToGenerativePart(data, mimeType) {
            return {
                inlineData: {
                    data,
                    mimeType,
                },
            };
        }

        // Note: The only accepted mime types are some image types, image/*.
        const imagePart = fileToGenerativePart(
            data,
            mimeType,
        );

        const result = await model.generateContent([task, imagePart]);
        const text = result.response.text()
        // console.log(result.response.text());
        return new Response(JSON.stringify(text), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error processing while processing request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
