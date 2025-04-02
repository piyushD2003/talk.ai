'use client'
import React, { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle } from "lucide-react";

const FileProcessing = () => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [info, setInfo] = useState("")
  const [task, setTask] = useState("")
  const [mimetype, setMimetype] = useState("")
  // const [data, setData] = useState({file:"",task:""})
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (file) {
      setMimetype(file.type)
      console.log("handle sumbit", mimetype);
    }
  }, [file, mimetype])

  const handleSubmit = async (e) => {
    setIsSubmitting(true)
    e.preventDefault();
    if (!file) return;
    if (file) {
      setMimetype(file.type)
      console.log("handlesumbit", mimetype);
    }

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

    const base64String = await fileToBase64(file);

    const res = await fetch('/api/AiFileProcess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: base64String,
        task: task,
        mimeType: mimetype, // Adjust this if you use a different audio format
        api: localStorage.getItem('Skey')
      }),
    });
    const result = await res.json()
    setInfo(result)
    setIsSubmitting(!res.ok)
    console.log(result);
    
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    if (file) {
      setMimetype(file.type)
    }
  };

  const handleTaskChange = (e) => {
    setTask(e.target.value)
    if (file) {
      setMimetype(file.type)
    }

  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center my-6">AI File Processing</h1>
        
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload File for Processing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {file && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-slate-300">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Input 
                    disabled={!file} 
                    className="bg-slate-700 border-slate-600 text-white" 
                    value={task} 
                    onChange={handleTaskChange} 
                    placeholder='What do you want to do with this file?' 
                    type="text"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!(task.length > 6) || !file || isSubmitting}
                  className={`whitespace-nowrap ${isSubmitting ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      Processing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Process File
                    </span>
                  )}
                </Button>
              </div>
              
              {isSubmitting && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Processing file...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        
        {info && (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Processing Results
              </h2>
              <div className="bg-slate-700 rounded-lg p-4 max-h-[50vh] overflow-y-auto text-slate-100 text-sm md:text-base">
                <div dangerouslySetInnerHTML={{ __html: info }} style={{ whiteSpace: "pre-wrap" }}></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  // return (
  //   <>
  //     <form className="bg-gray-700 p-3 rounded-lg shadow-md" onSubmit={handleSubmit}>
  //       <div className="items-center space-x-4 space-y-2 md:grid md:grid-cols-8 grid grid-row-3">
  //         <input type="file" className=":md:grid md:col-span-2 px-3 py-2 ms-3 mt-2 md:py-2 border border-gray-300 rounded-lg md:text-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" onChange={handleFileChange}
  //         />
  //         <input disabled={!file} className="md:grid md:col-span-5 px-3 h-10 border border-gray-300 rounded-lg text-black md:text-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={task} onChange={handleTaskChange} placeholder='What you wanted to do with file' type="text"
  //         />
  //         <button type="submit" disabled={!(task.length>6)||!file||isSubmitting} className={`md:grid md:col-span-1 md:w-22 md:h-10 w-16 h-8 md:text-[16px] text-sm grid justify-center px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}>{isSubmitting? 'Submitted' : 'Submit'}</button>
  //       </div>
  //     </form>
  //     <div>
  //     <div className='bg-gray-600 mx-6 pt-4 p-3 p-10 mt-10 text-[0.72rem] md:text-[1rem] rounded-[0.6cm] shadow-2xl'>
  //     <p className='' dangerouslySetInnerHTML={{ __html: info}} style={{ "whiteSpace": "pre-wrap", }}></p>
  //     </div>
  //     </div>
  //   </>
  // )
}

export default FileProcessing