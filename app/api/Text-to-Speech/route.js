import { NextResponse } from 'next/server';
import say from 'say';
import { PassThrough } from 'stream';

export async function POST(request) {
    try {
        
        // Parse the JSON body to get the text
        const { text } = await request.json();
        console.log(text);
        
        if (!text) {
            console.log("No text");
            
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Create a stream to hold the audio data
        const audioStream = new PassThrough();

        // Convert text to speech and pipe it into the stream
        await new Promise((resolve, reject) => {
            say.speak(text, 'Alex', 1.3, (err, speaking) => {
                if (err) {
                    reject(err);
                } else {
                    speaking.pipe(audioStream);
                    speaking.on('end', resolve);
                    speaking.on('error', reject);
                }
            });
        });

        // Create a response that streams the audio content
        return new Response(audioStream, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('Error processing text-to-speech request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
