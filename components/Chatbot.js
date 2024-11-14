"use client"
import React, { useState, useRef } from 'react';

const AudioRecorderNative = () => {
  const [recording, setRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [chatHistory, setChatHistory] = useState([
    {role: "user", parts: [{
        text: `You are a supportive and empathetic counselor designed to help students/people navigate their personal and academic/professional challenges. Your role is to listen actively, validate their feelings, and guide them through a thoughtful exploration of their concerns. Use a calm, compassionate tone and provide practical advice when appropriate. Your responses should focus on helping the user feel heard and understood, while gently encouraging them to find solutions or coping strategies. When the user shares something personal or challenging, offer empathy and support without judgment. Always respect their boundaries and be mindful of their emotional state.

        Example Interaction Structure:
        Introduction:
        "Hi there! I’m here to listen and support you. What’s on your mind today?"
  
        Active Listening:
        "That sounds like it’s been a lot to handle. Can you tell me more about how you’re feeling?"

        Empathy and Validation:
        "It’s completely understandable to feel that way given the situation. Your feelings are valid."

        Exploration:
        "What do you think has been the most challenging part for you? How has this been affecting your day-to-day life?"

        Problem-Solving:
        "Let’s think about some steps you might take to feel more in control of the situation. What’s one small thing you could try doing differently?"

        Conclusion:
        "You’ve done a great job exploring your thoughts today. Remember, it’s okay to take things one step at a time. I’m here whenever you need to talk again."` }],},
      { role: "model", parts: [{ text: "I understood." }], },])

  const startRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];

          // Convert Blob to Base64
          const base64String = await blobToBase64(audioBlob);

          // Now you can use `base64Audio` for API requests
          // sendAudioToGeminiAPI(base64String); // Call your function to send to Gemini API

          await sendAudioToGeminiAPI(base64String);

        };

        mediaRecorderRef.current.start();
        setRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    } else {
      // Stop recording
      mediaRecorderRef.current.stop();
      setRecording(false);
      setIsPlaying(true);

    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Example function to send the Base64 audio to the Gemini API
  // const sendAudioToGeminiAPI = async (base64Audio) => {
  //   // Your API call logic here
  //   // This would typically involve using fetch or axios to POST the base64Audio string
  // };

  const playtranscriptAudio = async (GeminiTranscript) => {
    // Sending the transcript to the server to get the audio response
    if (isPlaying) return; // Disable if already playing

    setIsPlaying(true);
    const response = await fetch('/api/Text-to-Speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: GeminiTranscript, api: localStorage.getItem('Skey') }),
    });

    setIsPlaying(!response.ok)

  }

  const sendAudioToGeminiAPI = async (base64Audio) => {
    try {
      const response = await fetch('/api/AiTranscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: 'audio/wav', // Adjust this if you use a different audio format
          history: chatHistory,
          api: localStorage.getItem('Skey')
        }),
      });
      const result = await response.json();
      if (result) {
        setChatHistory([...chatHistory, { role: "user", parts: [{ text: result.transcript }], }, { role: "model", parts: [{ text: result.AiResponse }], }])
      }
    setIsPlaying(!response.ok)

      // await playtranscriptAudio(result.AiResponse)
    } catch (error) {
      console.error('Error sending audio to Gemini API:', error);
    }
  };
  return (
    <div className='relative min-h-screen pb-20 flex flex-col'>
      <div className='text-xl md:text-4xl m-4 font-bold grid justify-items-center'>AI Chatbot</div>
      {/* {blobURL && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio src={blobURL} controls />
        </div>
      )} */}
      <div>
        {/* {transcript&&(
          <div>
            <p>Transcript: {transcript}</p>
            <p>AI: {AiResponse}</p>
          </div>
        )} */}
        {chatHistory.length < 2 ?
          chatHistory.length : chatHistory.slice(2).map((h, i) => {
            // console.log(chatHistory[0].parts[0].text);

            let flex = "flex flex-row"
            let bg = "bg-gray-500"
            let rounded = "rounded-r-[13px] rounded-bl-[13px]"
            let shadow = "shadow-[7px_9px_23px_0px_#2d3748]"
            if (h.role == "user") {
              flex = "flex flex-row-reverse"
              bg = "bg-gray-800"
              rounded = "rounded-l-[13px] rounded-br-[13px]"
              shadow = "shadow-[-5px_6px_23px_0px_#718096]"
            }
            return (<div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white text-[0.72rem] md:text-[1rem]`}><span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
              <p className='' dangerouslySetInnerHTML={{ __html: h.parts[0].text}} style={{ "whiteSpace": "pre-wrap", }}></p>

              {/* {h.parts[0].text} */}
            </span></div>)
          })}
      </div>
      <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
        <button type="button" onClick={startRecording} disabled={isPlaying? true : false} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>
        {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
      </div>
    </div>
  );
};

export default AudioRecorderNative;