import { NextResponse } from 'next/server';
import say from 'say';
import { PassThrough } from 'stream';

export async function POST(request) {
    try {
        
        // Parse the JSON body to get the text
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Generate the audio
        await new Promise((resolve, reject) => {
            say.speak(text, 'Microsoft David Desktop', 1.4, (err) => {
                if (err) {
                    return new Response(reject(err));
                } else {
                    return new Response(resolve("Done"));
                }
            });
          });
        
        return new Response("done");

    } catch (error) {
        console.error('Error processing text-to-speech request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
