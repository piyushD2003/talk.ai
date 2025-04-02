"use client"
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, SendIcon } from "lucide-react";

const AudioRecorderNative = () => {
  const [recording, setRecording] = useState(false);
  const [info, setInfo] = useState("")
  const [isPlaying, setIsPlaying] = useState(true);
  const [isinfo, setIsinfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [audioIndex, setAudioIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [userCharacter, setUserCharacter] = useState('');
  const [aiCharacter, setAiCharacter] = useState('');
  const [envDescription, setEnvDescription] = useState('');

  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Your Character", 
    "AI Character", 
    "Environment"
  ];


  const [chatHistory, setChatHistory] = useState([
    {
      role: "user", parts: [{
        text: `Please act as an Proffesional English language tutor. I want to improve my English through interactive conversation. Correct any grammatical errors I make, provide alternative phrasings or vocabulary, and explain any mistakes or corrections clearly. You can also ask me questions to test my understanding, and provide exercises or challenges related to grammar, vocabulary, and sentence structure, etc . Note: 1)You response should be very human not give filling of computerized conversation 2)Your Reponse must not much big`
      }],
    },
    { role: "model", parts: [{ text: "I understood, let start our interactive " }], },
  ])

  const handleSubmit = (e) => {
    e.preventDefault();

    if (envDescription.length < 10) return;
    chatHistory[0].parts[0].text = `
    **Instruction:**
        You are an AI engaged in a structured conversation with a user. You must fully embody your assigned character and interact naturally. Maintain a consistent tone, personality, and knowledge level appropriate to your role.
Your goal is to help the user improve their communication skills by providing constructive feedback, suggesting alternative responses, and keeping the conversation engaging. Avoid breaking character and ensure responses feel natural and immersive.
        **Environment Description:**
        ${envDescription}.

        There are two characters in this scenario:

        **I (User)** – ${userCharacter}
        **You (ai model)** – ${aiCharacter}.`

      console.log('prompt',chatHistory[0].parts[0].text);
        

    setIsinfo(true)
    setIsSetupComplete(true);
    setIsPlaying(false)
    console.log(chatHistory[0].parts[0].text);
  }

  // Next step in the setup wizard
  const handleNextStep = () => {
    // Validate current step
    if (
      (currentStep === 0 && userCharacter.length < 3) ||
      (currentStep === 1 && aiCharacter.length < 3) ||
      (currentStep === 2 && envDescription.length < 10)
    ) {
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  // Previous step in the setup wizard
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

      if (transcript) {

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
      audio.onplay = () => {
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
  };

  // Render setup input form based on current step
  const renderSetupInput = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Who are you?</h2>
            <p className="text-slate-500">Describe your character in this conversation</p>
            <Input
              value={userCharacter}
              onChange={(e) => setUserCharacter(e.target.value)}
              placeholder="e.g., A college student preparing for a job interview"
              className="bg-white/10 backdrop-blur border-slate-300"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Who am I?</h2>
            <p className="text-slate-500">Describe the AI character you&apos;ll talk to</p>
            <Input
              value={aiCharacter}
              onChange={(e) => setAiCharacter(e.target.value)}
              placeholder="e.g., An experienced HR manager with 10 years experience"
              className="bg-white/10 backdrop-blur border-slate-300"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Set the scene</h2>
            <p className="text-slate-500">Describe the environment and context</p>
            <Input
              value={envDescription}
              onChange={(e) => setEnvDescription(e.target.value)}
              placeholder="e.g., A job interview for a marketing position at a tech company"
              className="bg-white/10 backdrop-blur border-slate-300"
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          AI Conversation Roleplay
        </h1>
        <p className="mt-2 text-blue-200 text-sm md:text-base">
          Practice conversations in different scenarios with AI
        </p>
      </header>

      {/* Main content area */}
      <main className="flex-grow px-4 pb-24 max-w-5xl mx-auto w-full">
        {!isSetupComplete ? (
          <Card className="bg-white/10 backdrop-blur-md border border-blue-400/30 overflow-hidden">
            <CardContent className="p-6">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`text-xs font-medium ${currentStep >= index ? 'text-blue-300' : 'text-blue-300/40'}`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-blue-900/50 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
                {renderSetupInput()}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="bg-transparent border border-blue-400/50 text-blue-300 hover:bg-blue-800/30"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 0 && userCharacter.length < 3) ||
                    (currentStep === 1 && aiCharacter.length < 3) ||
                    (currentStep === 2 && envDescription.length < 10)
                  }
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {currentStep === steps.length - 1 ? "Start Conversation" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col">
            {/* Character info banner */}
            <div className="bg-gradient-to-r from-blue-800/80 to-purple-800/80 backdrop-blur-sm p-3 mb-4 rounded-lg text-sm flex justify-between items-center">
              <div>
                <span className="font-semibold text-blue-300">You:</span> {userCharacter}
              </div>
              <div>
                <span className="font-semibold text-purple-300">AI:</span> {aiCharacter}
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-2">
              {chatHistory.slice(2).map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 rounded-tr-none"
                        : "bg-gradient-to-br from-purple-600 to-purple-700 rounded-tl-none"
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
          </div>
        )}
      </main>

      {/* Recording button (fixed at bottom) */}
      {isSetupComplete && (
        <div className="fixed bottom-0 left-0 right-0">
          <div className="bg-gradient-to-t from-blue-900/90 to-transparent pt-16 pb-6">
            <div className="max-w-4xl mx-auto flex justify-center">
              <Button
                onClick={startRecording}
                disabled={isPlaying}
                size="lg"
                className={`rounded-full p-10 transition-all duration-200 transform ${
                  recording 
                    ? "bg-red-600 hover:bg-red-700 scale-110" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 scale-100"
                }`}
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
      )}
    </div>
  );
//   return (
//     <div className='relative min-h-screen pb-20 flex flex-col'>
//       <div className='text-xl md:text-4xl m-4 font-bold grid justify-items-center'>Communicate with AI</div>
//       <form class="w-full max-w-5xl mx-auto px-4" onSubmit={handleSubmit} >
//   <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-0 mb-1">
//     <div class="col-span-1">
//       <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="user-character">
//         Your Character
//       </label>
//       <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-2 px-3 mb-1 md:mb-0 leading-tight focus:outline-none focus:bg-white" id="user-character" type="text" name="user_character"
//       value={userCharacter}
//       onChange={(e) => setUserCharacter(e.target.value)}
//       placeholder="Enter your character" required/>
//     </div>
//     <div class="col-span-1">
//       <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="ai-character">
//         AI Character
//       </label>
//       <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="ai-character" type="text" name="ai_character"
//       value={aiCharacter}
//       onChange={(e) => setAiCharacter(e.target.value)}
//       placeholder="Enter AI character" required/>
//     </div>
//   </div>
//   <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//     <div class="col-span-2">
//       <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="env-description">
//         Environment Description
//       </label>
//       <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="env-description" type="text" name="env_description"
//       value={envDescription}
//       onChange={(e) => setEnvDescription(e.target.value)}
//       placeholder="Describe the environment" required/>
//     </div>
//     <div>
//       <button type="submit" class="w-full bg-blue-500 text-white py-2 px-3 rounded mt-5">Submit</button>
//     </div>
//   </div>
// </form>




//       <div>
//         {chatHistory.length < 2 ?
//           chatHistory.length : chatHistory.slice(2).map((h, i) => {
//             // console.log(chatHistory[0].parts[0].text);

//             let flex = "flex flex-row"
//             let bg = "bg-gray-500"
//             let rounded = "rounded-r-[13px] rounded-bl-[13px]"
//             let shadow = "shadow-[7px_9px_23px_0px_#2d3748]"
//             if (h.role == "user") {
//               flex = "flex flex-row-reverse"
//               bg = "bg-gray-800"
//               rounded = "rounded-l-[13px] rounded-br-[13px]"
//               shadow = "shadow-[-5px_6px_23px_0px_#718096]"
//             }
//             return (
//               <div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white text-[0.72rem] md:text-[1rem]`}>
//                 <span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
//                   {h.parts[0].text === "" ? (
//                     <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-white"></div>
//                   ) : (
//                     h.parts[0].text
//                   )}
//                 </span>
//               </div>)
//           })}
//       </div>
//       <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
//         <button type="button" onClick={startRecording} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>
//         {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
//       </div>
//     </div>
//   );
};

export default AudioRecorderNative;
