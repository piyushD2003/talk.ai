"use client"
import React, { useState, useRef } from 'react';

const AudioRecorderNative = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [chatHistory, setChatHistory] = useState([
    { role: "user", parts: [{ text: `Please act as an Proffesional English language tutor. I want to improve my English through interactive conversation. Correct any grammatical errors I make, provide alternative phrasings or vocabulary, and explain any mistakes or corrections clearly. You can also ask me questions to test my understanding, and provide exercises or challenges related to grammar, vocabulary, and sentence structure, etc . Note: 1)You response should be very human not give filling of computerized conversation 2)Your Reponse must not much big 3. provide you response in this format: 
      "{
      \"ResponseTutor\":\" \",
      \"Feedback\":\" \"
      }"
      ; In ResponseTutor key, provide suggestion or whatever you wanted and In Feedback key,just provide the improved grammar sentence of my sentance dont explain otherwise if not needed put " ". 3)Ensure the response is strictly in JSON format without any markdown, 'json', or backticks. Only output valid JSON. ` }], },
    { role: "model", parts: [{ text: "I understood, let start our interactive " }], },
  ])

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
    }
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
    const response = await fetch('/api/Text-to-Speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: GeminiTranscript }),
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create an audio element and play the audio
    const audio = new Audio(audioUrl);
    audio.oncanplaythrough = () => audio.play();
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
          api : localStorage.getItem('Skey')
        }),
      });
      const result = await response.json();
      if (result) {
        setChatHistory([...chatHistory, { role: "user", parts: [{ text: result.transcript }], }, { role: "model", parts: [{ text: result.AiResponse }], }])
      }
      const jsonObject = JSON.parse(result.AiResponse);
      console.log("Response json", result.AiResponse);
      // console.log("Response json",jsonObject);

      // console.log(jsonObject.ResponseTutor);
      // console.log(jsonObject.Feedback);


      await playtranscriptAudio(jsonObject.ResponseTutor)
    } catch (error) {
      console.error('Error sending audio to Gemini API:', error);
    }
  };
  return (
    <div className='relative min-h-screen pb-20 flex flex-col'>
      <div className='text-xl md:text-4xl m-4 font-bold grid justify-items-center'>Communicate with AI</div>
      <div>
        {chatHistory.length < 2 ?
          chatHistory.length : chatHistory.slice(2).map((h, i) => {
            let res;
            let feed;
            if (h.role == "model") {
              const ResponseHis = JSON.parse(h.parts[0].text)
              console.log("Testing:", ResponseHis)
              res = ResponseHis.ResponseTutor
              feed = ResponseHis.Feedback
            }
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
            return (
              <div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white `}><span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
                {h.role != "model" ? h.parts[0].text : <>{res}<hr></hr><p className='bg-gray-600 p-1'>{feed}</p></>}
                {/* {ResponseHis.correct} */}
              </span></div>
            )
          })}
      </div>
      <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
        <button type="button" onClick={startRecording} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>
        {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
      </div>
    </div>
  );
};

export default AudioRecorderNative;
