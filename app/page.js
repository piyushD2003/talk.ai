'use client'
import React, { useEffect, useState } from "react";
export default function Home() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const fullText = "Unlock your potential with our AI-driven companion \nExperience a smarter way to achieve your goals.";

  useEffect(() => {
    if (index < fullText.length) {
      const timeoutId = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex((prevIndex) => prevIndex + 1);
      }, 40); // Adjust speed here (100ms for each letter)

      return () => clearTimeout(timeoutId); // Clean up timeout on each render
    }
  }, [index, fullText]);
  return (
    <>
    <div className="relative pb-20 h-screen flex flex-col bg-cover bg-center" 
         style={{ backgroundImage: "url('https://burst.shopifycdn.com/photos/icy-summit-of-a-mountain-on-a-frosty-night.jpg?width=1000&format=pjpg&exif=0&iptc=0')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
        <h1 className="text-7xl font-bold tracking-widest ">TALK.AI</h1>
        <pre className="mt-4 md:text-lg text-sm max-w-lg overflow-hidden h-[112px]">
        {text}
          {/* Mountains are formed through tectonic forces or volcanism. These forces can locally raise the surface of the earth. Mountains erode slowly through the action of rivers, weather conditions, and glaciers. */}
        </pre>
      </div>

    </div>
    </>
  );
}
