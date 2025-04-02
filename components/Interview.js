"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mic, MicOff } from "lucide-react";

const AudioRecorderNative = () => {

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [Resume, setResume] = useState("is not avaliable")
  const [info, setInfo] = useState("")
  const [isPlaying, setIsPlaying] = useState(true);
  const [isinfo, setIsinfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [audioIndex, setAudioIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    { role: "user", parts: [{ text: `You are the Interviewer name whatever you wanted to give your self, Mandatory thing for you 1.Your words should be very human and dont provide your gesture explanation 2.Your Response Not feel some like a AI talk 3.Be a Strict person 'according my response' 4.In this conversation you have to stop when you made a conclusion and end the interview 5. Whenever you wanted to end the interview you can end if you think I'm not taking this interview seriously or commenting something inappropriate 6.Don't get from your charater whatever I say don't feel your self a AI until this conversation ends 7.Your response should be 250 to 300 charater` }], },
    { role: "model", parts: [{ text: "I understood." }], },
  ])

  const changevalue = (e) => {
    setInfo(e.target.value)
  }
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Extract Base64 part from Data URL
        resolve(base64String);
      };
  
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
  
      reader.readAsDataURL(file); // Read file as Data URL
    });
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();

    if (!file) return;

    setIsSubmitting(true);

    
    try {
      // const formData = new FormData();
      // formData.append('file', file); // Append the file to the form data
      // formData.append('mimeType', 'application/pdf'); // If you need to send the MIME type
      console.log(file);
      const base64String = await fileToBase64(file);
      
      // console.log(formData);

      const res = await fetch('/api/File-to-Text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64String,
          mimeType: 'application/pdf', // Adjust this if you use a different audio format
          api: localStorage.getItem('Skey')
        }),
      });
      const result = await res.json()
      chatHistory[0].parts[0].text = `You are the Interviewer,Interview is about ${info}. Resume: '${result}',look at my resume and anaylise it then take interview and ask the Technical question related to interview based. Mandatory thing for you 1.Your words should be very human and dont provide your gesture explanation 2.Your Response Not feel some like a computerised talk 3.Be a Strict person 'according my response' 4.In this conversation you have to stop when you made a conclusion and end the interview 5. Whenever you wanted to end the interview you can end if you think I'm not taking this interview seriously or commenting something inappropriate 6.Don't get from your charater whatever I say don't feel your self a AI until this conversation ends`
      setResume(result)
      setIsSubmitting(false)
      console.log(Resume);

    } catch (error) {
      console.error('An error occurred while uploading the file:', error);
    }

  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (info.length < 10) return;
    chatHistory[0].parts[0].text = `You are the Interviewer, Interview is about ${info}. Resume:'${Resume}',look at my resume and anaylise it then take interview and ask the Technical question related to interview based. Mandatory thing for you 1.Your words should be very human and dont provide your gesture explanation and dont provide your gesture explanation 2.Your Response Not feel some like a computerised talk 3.Be a Strict person 'according my response' 4.In this conversation you have to stop when you made a conclusion and end the interview 5. Whenever you wanted to end the interview you can end if you think I'm not taking this interview seriously or commenting something inappropriate 6.Don't get from your charater whatever I say don't feel your self a AI until this conversation ends`
    setIsinfo(true)
    setIsPlaying(false)
    console.log(Resume);
    console.log(chatHistory[0].parts[0].text);

  }

  const startRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const base64Audio = await blobToBase64(event.data);
            await sendAudioToGeminiAPI(base64Audio);
          }
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

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioToGeminiAPI = async (base64Audio) => {
    setChatHistory(prevHistory => [
      ...prevHistory,
      { role: "user", parts: [{ text: "" }] },  // Empty text for spinner
      { role: "model", parts: [{ text: null }] } // Placeholder for AI
    ]);

    try {
      const STT = await fetch('/api/Speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: 'audio/wav', // Adjust this if you use a different audio format
          api: localStorage.getItem('Skey')
        }),
      });
      const transcript = await STT.json();
      console.log(transcript);
      if (transcript) {
        let transcriptText = "";
        transcript.transcript.split("").forEach((letter, index) => {
          setTimeout(() => {
            transcriptText += letter;
            setChatHistory(prevHistory => {
              const updatedHistory = [...prevHistory];
              updatedHistory[updatedHistory.length - 2].parts[0].text = transcriptText; // Update user message
              return updatedHistory;
            });
          }, index * 10); // Typing effect delay
        });

        setChatHistory(prevHistory => {
          const updatedHistory = [...prevHistory];
          updatedHistory[updatedHistory.length - 1].parts[0].text = ""; // Update user message
          return updatedHistory;
        });
      }
      
      if(transcript){

        const response = await fetch('/api/AiResult', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: transcript.transcript,
            // mimeType: 'audio/wav', // Adjust this if you use a different audio format
            history: chatHistory,
            api: localStorage.getItem('Skey')
          }),
        });
        const result = await response.json();
        console.log(result);
        // setText(result.transcript)
        if (result) {
        //   let AiResponseText = "";
        //   result.AiResponse.split("").forEach((letter, index) => {
        //   setTimeout(() => {
        //     AiResponseText += letter;
        //     setChatHistory(prevHistory => {
        //       const updatedHistory = [...prevHistory];
        //       updatedHistory[updatedHistory.length - 1].parts[0].text = AiResponseText; // Update user message
        //       return updatedHistory;
        //     });
        //   }, index * 30); // Typing effect delay
        // });

          // setChatHistory(prevHistory => {
          //   const updatedHistory = [...prevHistory];
          //   updatedHistory[updatedHistory.length - 1].parts[0].text = result.AiResponse;  // Replace the last model entry with AI response
          //   return updatedHistory;
          // });
          // setChatHistory([...chatHistory, { role: "user", parts: [{ text: result.transcript }], }, { role: "model", parts: [{ text: result.AiResponse }], }])
        }
        // setText("")
        await playtranscriptAudio(result.AiResponse)
      }
    } catch (error) {
      console.error('Error sending audio to Gemini API:', error);
    }
  };

  const playtranscriptAudio = async (GeminiTranscript) => {
    try {
      
      if (isPlaying) return; // Disable if already playing

      setIsPlaying(true);
      // Sending the transcript to the server to get the audio response
      const response = await fetch('/api/Text-to-Speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: GeminiTranscript }),
      });
      console.log(response);
      const audioBlob = await response.blob();
      console.log(audioBlob);

      const audiourl = URL.createObjectURL(audioBlob);
      console.log(audiourl);
      const audio = new Audio();
      audio.src = audiourl
      console.log(audio);
      audio.playbackRate = 1.4
      audio.onplay = () =>{
        let AiResponseText = "";
          GeminiTranscript.split("").forEach((letter, index) => {
          setTimeout(() => {
            AiResponseText += letter;
            setChatHistory(prevHistory => {
              const updatedHistory = [...prevHistory];
              updatedHistory[updatedHistory.length - 1].parts[0].text = AiResponseText; // Update user message
              return updatedHistory;
            });
          }, index * 65); // Typing effect delay
        });
      }
      audio.play();
      audio.onended = () => {
        // setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('playtranscriptAudio function error:', error);
    }

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center my-6">AI Interview Assistant</h1>
        
        {/* Resume Upload Section */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSubmit1}>
              <Input 
                type="file" 
                onChange={handleFileChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                type="submit" 
                disabled={!file || isSubmitting} 
                className="whitespace-nowrap"
                variant={Resume !== "No resume uploaded" ? "secondary" : "default"}
              >
                {isSubmitting ? "Uploading..." : Resume !== "No resume uploaded" ? "Resume Uploaded" : "Upload Resume"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Interview Info Section */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interview Information</h2>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSubmit}>
              <Input 
                type="text" 
                placeholder="What job role are you interviewing for?" 
                value={info} 
                onChange={changevalue}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                type="submit" 
                disabled={isinfo} 
                className="whitespace-nowrap"
                variant={isinfo ? "secondary" : "default"}
              >
                {isinfo ? "Ready to Start" : "Set Interview Type"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chat History */}
        <div className="mb-24">
          {chatHistory.slice(2).map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === "user" 
                    ? "bg-blue-600 rounded-tr-none" 
                    : "bg-slate-700 rounded-tl-none"
                }`}
              >
                {message.parts[0].text === "" ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <p className="text-sm md:text-base">{message.parts[0].text}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recording Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent pt-16 pb-6">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button
              onClick={startRecording}
              disabled={!setIsinfo || isPlaying}
              size="lg"
              className={`rounded-full p-10 ${
                recording 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-all duration-200 transform ${recording ? 'scale-110' : 'scale-100'}`}
            >
              {recording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className='relative min-h-screen pb-20 flex flex-col'>
  //     <div className='text-xl md:text-4xl m-4 font-bold grid justify-items-center'>AI Interview</div>

  //     {/* <FileUpload onDataReceived={setResume} /> */}
  //     <div className="flex items-center space-x-4">
  //       <input className="md:size-11 size-7 flex-grow px-3 md:py-2 border border-gray-300 rounded-lg md:text-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="file" onChange={handleFileChange}
  //       />
  //       <button type="submit" disabled={isSubmitting} onClick={handleSubmit1} className={`md:w-22 md:h-10 w-16 h-8 md:text-[16px] text-sm grid justify-center px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}>
  //         {Resume !== "is not avaliable" ? 'Done' : 'Submit'}
  //       </button>
  //     </div>

  //     <div className="flex items-center m-3 space-x-4">
  //       <input className="text-black md:size-11 size-7 flex-grow px-3 md:py-2 border border-gray-300 rounded-lg md:text-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="text" value={info} onChange={changevalue} />
  //       <button type="submit" disabled={isinfo} className={`md:w-22 md:h-10 w-16 h-8 md:text-[16px] text-sm grid justify-center px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${isinfo ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'} `} onClick={handleSubmit}>{isinfo ? 'Done' : 'Submit'}</button>
  //     </div>

  //     <div>
  //       {chatHistory.length < 2 ?
  //         chatHistory.length : chatHistory.slice(2).map((h, i) => {
  //           // console.log(chatHistory[0].parts[0].text);

  //           let flex = "flex flex-row"
  //           let bg = "bg-gray-500"
  //           let rounded = "rounded-r-[13px] rounded-bl-[13px]"
  //           let shadow = "shadow-[7px_9px_23px_0px_#2d3748]"
  //           if (h.role == "user") {
  //             flex = "flex flex-row-reverse"
  //             bg = "bg-gray-800"
  //             rounded = "rounded-l-[13px] rounded-br-[13px]"
  //             shadow = "shadow-[-5px_6px_23px_0px_#718096]"
  //           }
  //           return (
  //           <div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white text-[0.72rem] md:text-[1rem]`}>
  //             <span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
  //               {h.parts[0].text === "" ? (
  //                   <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-white"></div> 
  //                 ) : (
  //                   h.parts[0].text
  //                 )}
  //             </span>
  //           </div>)
  //         })}
          
  //     </div>
  //     <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
  //       <button type="button" onClick={startRecording} disabled={isPlaying ? true : false} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>

  //       {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
  //     </div>
  //   </div>
  // );
};

export default AudioRecorderNative;
