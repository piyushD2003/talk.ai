'use client'
import React, { useEffect, useState, useRef } from "react";
import { useModal } from "@/context/ModalContext"
export default function Home() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const fullText = "Unlock your potential with our AI-driven companion \nExperience a smarter way to achieve your goals.";
  const { showLoginModal, setShowLoginModal, showQuickModal, setShowQuickModal } = useModal()
  // const [showQuickModal, setShowQuickModal] = useState(false);
  // const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (index < fullText.length) {
      const timeoutId = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex((prevIndex) => prevIndex + 1);
      }, 40); // Adjust speed here (100ms for each letter)

      return () => clearTimeout(timeoutId); // Clean up timeout on each render
    }else {
      // Wait for 2 seconds after full text is displayed, then reset
      const resetTimeout = setTimeout(() => {
        setText('');
        setIndex(0);
      }, 4000); // 2 seconds delay before restarting

      return () => clearTimeout(resetTimeout);
    }
  }, [index, fullText]);


  return (
    <>
    
    {/* <Navbar showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} showQuickModal={showQuickModal} setShowQuickModal={setShowQuickModal} /> */}
    {/* <FrontPageLayout showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} showQuickModal={showQuickModal} setShowQuickModal={setShowQuickModal} /> */}
    <div className="relative pb-20 h-screen flex flex-col bg-cover bg-center" 
         style={{ backgroundImage: "url('https://burst.shopifycdn.com/photos/icy-summit-of-a-mountain-on-a-frosty-night.jpg?width=1000&format=pjpg&exif=0&iptc=0')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent 
              bg-[linear-gradient(to_right,#fff,#9b87f5,#6E59A5,#0EA5E9,#33C3F0,#8B5CF6,#fff)] 
              bg-[length:200%_auto] animate-gradient tracking-tight">
            AI BASED JOB CRACKER
          </h1>
        <pre className="mt-4 md:text-lg text-sm max-w-lg overflow-hidden h-[90px]">
        {text}
          {/* Mountains are formed through tectonic forces or volcanism. These forces can locally raise the surface of the earth. Mountains erode slowly through the action of rivers, weather conditions, and glaciers. */}
        </pre>
      {/* Buttons to open modal */}
        {localStorage.getItem("Skey")?"":
      <div className="mt-2 flex space-x-4">
            <button 
              onClick={() => setShowQuickModal(true)} 
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Quick Use

              </span>
            </button>
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Sign In
              </span>
            </button>
          </div>
            }
            </div>
    </div>
    <style jsx>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradientAnimation 8s infinite linear;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </>
  );
}
