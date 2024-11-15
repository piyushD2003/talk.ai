// import { NextResponse } from 'next/server';
// import say from 'say';
// import fs from 'fs';
// import path from 'path'

// export async function POST(request) {
//     try {
        
//         // Parse the JSON body to get the text
//         const { text } = await request.json();
//         if (!text) {
//             return NextResponse.json({ error: 'Text is required' }, { status: 400 });
//         }

//         // Generate the audio
//         await new Promise((resolve, reject) => {
//             say.speak(text, 'Microsoft David Desktop', 1.4, (err) => {
//                 if (err) {
//                     return new Response(reject(err));
//                 } else {
//                     return new Response(resolve("Done"));
//                 }
//             });
//           });
        
//           return new Response(JSON.stringify("done"), {
//             headers: { 'Content-Type': 'application/json' },
//           });

//     } catch (error) {
//         console.error('Error processing text-to-speech request:', error);
//         return new Response('Internal Server Error', { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request) {
    try {
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Get the URL for the TTS audio
        const url = googleTTS.getAllAudioUrls(text, {
            lang: 'en',
            slow: true,
            host: 'https://translate.google.com',
        });
        console.log(url);
        
        // Fetch the audio data as a blob or stream, then return it to the client
        // const urlarray = url.map(item=> item.url)
        const audioBuffers = await Promise.all(
            url.map(async (url) => {
                const audioResponse = await fetch(url.url);
                return await audioResponse.arrayBuffer();
            })
        );
        const combinedBuffer = Buffer.concat(audioBuffers.map(buffer=>Buffer.from(buffer)));
        console.log(audioBuffers);
        console.log("combined:",combinedBuffer.length, combinedBuffer);
        
        const audioResponse = await fetch(url[0].url);
        const audioBuffer = await audioResponse.arrayBuffer();
        console.log(audioBuffer);
        
        // JSON.stringify(urlarray)
        return new NextResponse(combinedBuffer, {
            headers: {
                // 'Content-Type': 'application/json',
                'Content-Type': 'audio/mpeg',
                // 'Content-Disposition': 'attachment; filename="output.mp3"',
            },
        });
    } catch (error) {
        console.error('Error processing text-to-speech request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
