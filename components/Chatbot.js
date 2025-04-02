"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const AudioRecorderNative = () => {
  const [recording, setRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState(null)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "user", parts: [{
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
        "You’ve done a great job exploring your thoughts today. Remember, it’s okay to take things one step at a time. I’m here whenever you need to talk again."` }],
    },
    { role: "model", parts: [{ text: "I understood." }], },])

    const chatContainerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState("calc(100vh - 240px)");
  
    useEffect(() => {
      const updateHeight = () => {
        const navbarHeight = 60;
        const footerHeight = 60;
        const inputAreaHeight = 80;
        const headerHeight = 70;
        
        const availableHeight = window.innerHeight - (navbarHeight + footerHeight + inputAreaHeight + headerHeight);
        setContainerHeight(`${availableHeight}px`);
      };
  
      updateHeight();
      window.addEventListener("resize", updateHeight);
      
      return () => window.removeEventListener("resize", updateHeight);
    }, []);
  

  const messagesEndRef = useRef(null);

useEffect(() => {
  // Scroll to bottom when messages change
  scrollToBottom();
}, [chatHistory]);

const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

useEffect(() => {
  if (isProcessing) {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 600);

    return () => clearInterval(interval);
  } else {
    setProgress(0);
  }
}, [isProcessing]);


  const handleSubmit = async () => {

    setIsProcessing(true)
    setIsPlaying(true)
    setChatHistory(prevHistory => [
      ...prevHistory,
      { role: "user", parts: [{ text: text }] },  // Empty text for spinner
      { role: "model", parts: [{ text: null }] } // Placeholder for AI
    ]);
    const response = await fetch('/api/AiResult', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        // mimeType: 'audio/wav', // Adjust this if you use a different audio format
        history: chatHistory,
        api: localStorage.getItem('Skey')
      }),
    });
    const result = await response.json();
    console.log(result);
    // setText(result.transcript)
    setText(null)
    if (result) {
      let AiResponseText = "";
      result.AiResponse.split("").forEach((letter, index) => {
        setTimeout(() => {
          AiResponseText += letter;
          setChatHistory(prevHistory => {
            const updatedHistory = [...prevHistory];
            updatedHistory[updatedHistory.length - 1].parts[0].text = AiResponseText; // Update user message
            return updatedHistory;
          });
        }, index * 10); // Typing effect delay
      });
      setIsProcessing(false)
      setIsPlaying(false)


      // setChatHistory(prevHistory => {
      //   const updatedHistory = [...prevHistory];
      //   updatedHistory[updatedHistory.length - 1].parts[0].text = result.AiResponse;  // Replace the last model entry with AI response
      //   return updatedHistory;
      // });
      // setChatHistory([...chatHistory, { role: "user", parts: [{ text: result.transcript }], }, { role: "model", parts: [{ text: result.AiResponse }], }])
    }
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
        // setText(result.transcript)
        if (result) {
          let AiResponseText = "";
          result.AiResponse.split("").forEach((letter, index) => {
            setTimeout(() => {
              AiResponseText += letter;
              setChatHistory(prevHistory => {
                const updatedHistory = [...prevHistory];
                updatedHistory[updatedHistory.length - 1].parts[0].text = AiResponseText; // Update user message
                return updatedHistory;
              });
            }, index * 10); // Typing effect delay
          });
          setIsPlaying(false);


          // setChatHistory(prevHistory => {
          //   const updatedHistory = [...prevHistory];
          //   updatedHistory[updatedHistory.length - 1].parts[0].text = result.AiResponse;  // Replace the last model entry with AI response
          //   return updatedHistory;
          // });
          // setChatHistory([...chatHistory, { role: "user", parts: [{ text: result.transcript }], }, { role: "model", parts: [{ text: result.AiResponse }], }])
        }
        // setText("")
        // await playtranscriptAudio(result.AiResponse)
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

  }
  return(
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 rounded-lg shadow-lg"
    ref={chatContainerRef}>
 <h1 className="text-3xl md:text-4xl font-bold text-center my-4">AI Chatbot</h1>
 <ScrollArea className={`mb-6 pr-4`} style={{ height: containerHeight }}>
   <div className="px-2">
          {chatHistory.length > 2 && 
            chatHistory.slice(2).map((message, index) => (
              <div 
                key={index} 
                className={`my-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card className={`max-w-[80%] border-0 ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-800 border-slate-700"
                }`}>
                  <CardContent className="p-4">
                    {message.parts[0].text === "" ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.parts[0].text }} 
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
        </ScrollArea>
      
      <div className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 pt-3 pb-2 rounded-b-lg">
        {isProcessing && (
          <div className="mb-2 px-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex gap-2 items-end px-3">
          <Textarea
            placeholder="Type your message..."
            value={text || ""}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[40px] max-h-24 bg-slate-700 border-slate-600 text-white resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          {text ? (
            <Button 
              size="icon"
              disabled={isProcessing || !text}
              onClick={() => {
                handleSubmit();
                setText("");
              }}
              variant="default"
              className="h-10 w-10 rounded-full"
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={startRecording}
              disabled={isPlaying}
              variant={recording ? "destructive" : "default"}
              className="h-10 w-10 rounded-full"
            >
              {recording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className='relative min-h-screen pb-20 flex flex-col'>
  //     <div className='text-xl md:text-4xl m-4 font-bold grid justify-items-center'>AI Chatbot</div>
  //     {/* {blobURL && (
  //       <div>
  //         <h3>Recorded Audio:</h3>
  //         <audio src={blobURL} controls />
  //       </div>
  //     )} */}
  //     <div>
  //       {/* {transcript&&(
  //         <div>
  //           <p>Transcript: {transcript}</p>
  //           <p>AI: {AiResponse}</p>
  //         </div>
  //       )} */}
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
  //           return (<div key={i} className={`w-54 m-3 my-6 mx-5 ${flex} text-white text-[0.72rem] md:text-[1rem]`}><span className={`${rounded} ${shadow} max-w-[70%] p-4 ${bg}`}>
  //             {h.parts[0].text === "" ? (
  //               <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-white"></div>
  //             ) : (
  //               <p className='' dangerouslySetInnerHTML={{ __html: h.parts[0].text }} style={{ "whiteSpace": "pre-wrap", }}></p>
  //             )}
  //             {/* {h.parts[0].text} */}
  //           </span></div>)
  //         })}
  //     </div>
  //     <div className={`fixed w-full p-3 flex items-center bg-[#1F1F1F] shadow-md transition-all duration-300 bottom-0`}>
  //       <div className="flex-grow mx-3 px-4 py-2 bg-[#3A3A3A] text-white rounded-3xl focus:outline-none">

  //         <textarea
  //           type="text"
  //           placeholder="Ask anything"
  //           value={text}
  //           onChange={(e) => setText(e.target.value)}
  //           className="w-full max-h-[150px] min-h-[40px] flex-grow mx-3 px-4 py-2 bg-[#3A3A3A] text-white rounded-xl focus:outline-none overflow-y-auto resize-none "
  //           style={{
  //             scrollbarWidth: "thin", // For Firefox
  //             scrollbarColor: "#777 #3A3A3A", // Thumb and Track color
  //           }}
  //           rows={1}
  //           onInput={(e) => {
  //             e.target.style.height = "40px"; // Reset height to prevent infinite growth
  //             e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px"; // Expand up to 150px
  //           }}
  //         />
  //         {
  //           text ?
  //             <button className="flex justify-end  bg-gray-700 px-4 py-2 rounded-full text-white ml-auto" type='button' onClick={() => { handleSubmit(); setText("") }} disabled={isProcessing ? true : false}>
  //               {isProcessing ? <>⬛</> : <>🔍</>}
  //             </button>
  //             :
  //             <button className={`flex justify-end ml-auto p-2 rounded-full text-black ${recording ? 'bg-red-500' : 'bg-white'}`} type="button" onClick={startRecording} disabled={isPlaying ? true : false} >🎙️</button>
  //         }
  //       </div>


  //     </div>
  //     {/* <div className='absolute bottom-0 w-full mb-2 grid justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
  //       <button type="button" onClick={startRecording} disabled={isPlaying ? true : false} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{recording ? 'Stop Recording' : 'Start Recording'}</button>
  //     </div> */}
  //   </div>
  // );
};

export default AudioRecorderNative;