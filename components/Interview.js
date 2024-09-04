"use client"
import React, { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';

const AudioRecorderNative = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [Resume, setResume] = useState(null)
  const [chatHistory, setChatHistory] = useState([
    { role: "user", parts: [{ text: `You are the Interviewer name whatever you wanted to give your self, this is our first face to face meeting.. you dont know about me,Mandatory thing for you 1.Your words should be very human and dont provide your gesture explanation 2.Your Response Not feel some like a AI talk 3.Be a Strict person 'according my response' 4.In this conversation you have to stop when you made a conclusion and end the interview 5. Whenever you wanted to end the interview you can end if you think I'm not taking this interview seriously or commenting something inappropriate 6.Don't get from your charater whatever I say don't feel your self a AI until this conversation ends` }],},
    { role: "model", parts: [{ text: "I understood." }],},
  ])

  useEffect(() => {
      if(Resume){
        chatHistory[0].parts[0].text = `You are the Interviewer named "Sanjay", this is our first face to face meeting.. you dont know about me, This is a resume '${Resume}',look at my resume and anaylise it then take interview. Mandatory thing for you 1.Your words should be very human and dont provide your gesture explanation 2.Your Response Not feel some like a computerised talk 3.Be a Strict person 'according my response' 4.In this conversation you have to stop when you made a conclusion and end the interview 5. Whenever you wanted to end the interview you can end if you think I'm not taking this interview seriously or commenting something inappropriate 6.Don't get from your charater whatever I say don't feel your self a AI until this conversation ends`
      }
    }, [Resume])

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
    }else {
      // Stop recording
      mediaRecorderRef.current.stop();
      setRecording(false);
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
  
  const playtranscriptAudio = async (GeminiTranscript) =>{
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
        }),
      });
      const result = await response.json();
      if(result){
        setChatHistory([...chatHistory,{ role: "user", parts: [{ text:result.transcript }],},{ role: "model", parts: [{ text: result.AiResponse}],}])
      }
      
      await playtranscriptAudio(result.AiResponse)
    } catch (error) {
      console.error('Error sending audio to Gemini API:', error);
    }
  };
  return (
    <div className='relative min-h-screen pb-20 flex flex-col'>
        <div className='text-4xl m-4 font-bold grid justify-items-center'>AI Interview</div>
        <FileUpload onDataReceived={setResume}/>
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
        {chatHistory.length<2?
          chatHistory.length:chatHistory.slice(2).map((h,i)=>{
          // console.log(chatHistory[0].parts[0].text);
          
          let flex ="flex flex-row"
          let bg = "bg-gray-500"
          let rounded = "rounded-r-[13px] rounded-bl-[13px]"
          let shadow = "shadow-[7px_9px_23px_0px_#2d3748]"
          if(h.role == "user"){
            flex = "flex flex-row-reverse"
            bg = "bg-gray-800"
            rounded = "rounded-l-[13px] rounded-br-[13px]"
            shadow = "shadow-[-5px_6px_23px_0px_#718096]"
          }
          return (<div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white `}><span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
            {h.parts[0].text}
            </span></div>)
        })}
      </div>
      <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
      <button type="button" onClick={startRecording} class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>
      {/* <button type="button" onClick={stopRecording} disabled={!recording} class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
      </div>
    </div>
  );
};

export default AudioRecorderNative;
