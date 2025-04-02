"use client"
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Clock, Award, AlertTriangle } from "lucide-react";
const Aptitude = () => {
    const [mocktest, setMocktest] = useState({ test: "" })
    const [time, settime] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showresult, setShowResult] = useState(false)
    let [string, setString] = useState([])
    const [text, setText] = useState('')
    const [right, setRight] = useState(0)
    const [wrong, setWrong] = useState(0)
    const [selectedOption, setSelectedOption] = useState('');
    let [chatHistory, setChatHistory] = useState([
        { role: "user", parts: [{ text: `` }], },
        { role: "model", parts: [{ text: "I understood, let start our interactive " }], },
    ])
    useEffect(() => {
        // Fetch the text file from the public directory
        fetch('/question.txt')
            .then((response) => response.text())
            .then((data) => setText(data))
            .catch((error) => console.error('Error fetching the text file:', error));
    }, []);

    useEffect(() => {
        if(time===-1){
            setIsSubmitting(false)
        }
    }, [time])

    const changevalue = (e) => {
        setMocktest({ ...mocktest, [e.target.name]: e.target.value })
    }

    const handletime = (e) => {
        settime(e.target.value * 60)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (mocktest.test == "" || time == 0) return;

        setIsSubmitting(true)
        console.log("clicked", isSubmitting, time);
    }

    const handleSubmit1 = async (e) => {
        try {
            console.log("next button",isSubmitting);
            
            const response = await fetch('api/AiAptitude', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    data: mocktest,
                    history: chatHistory,
                    mimetype: 'application/json',
                    api: localStorage.getItem('Skey')
                })
            })
            let result = await response.json();
            console.log("res",result.AiResponse);
            
            if (result) {
                setChatHistory([...chatHistory, { role: "model", parts: [{ text: result.AiResponse }], }])
            }
            // result = result.replace(/\n/g, '<br>');
            
            let j = JSON.parse(result.AiResponse)
            console.log("Ress",j);
            console.log(j.options);
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
                    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
                }
                return array;
            }
            const arr = shuffleArray(j.options.slice())

            j.options = arr
            // console.log(chatHistory);
            setString(string.concat(j))
            // setIsSubmitting(false)



        } catch (error) {
            console.error('Error Getting Aptitude response:', error);
        }
    }
    const handleSubmit2 = (e) => {
        e.preventDefault()
        console.log(showresult);
        setShowResult(false)
        setIsSubmitting(true)
        string[string.length - 1]['choosed option'] = selectedOption
        if (string[string.length - 1]['choosed option'] === string[string.length - 1]['correct option']) {
            setRight(right + 1)
        }
        else {
            setWrong(wrong + 1)
        }

    }
    const changevalue1 = (e) => {
        setShowResult(true)
        setSelectedOption(e.target.value)
    }
    useEffect(() => {
        chatHistory[0].parts[0].text = `
        give a single question(have 4 options each) for given test: ${mocktest.test},
        Note: 
        1.provide you response in this format:
        "{
            \"question\":\" \",
            \"options\":[],
            \"correct option\":\" \",
            \"choosed option\":\"\",
            \"Explain\":\" \"

        }";2)Ensure the response is strictly in JSON format without any markdown, [json ''' '''], or backticks. Only output valid JSON. 3)You only have to give the question nothing else. 4) This response i.e "user" is my last after that is not avaliable. 5)choosed should be empty in starting. 6)In options, right answer should be random not only in first place, REMEBER THAT! 7) In Explain: must and compulsory provide information why correct option is correct(in brief) Mandatory`

    }, [isSubmitting,chatHistory,mocktest.test])

    useEffect(() => {
        if (isSubmitting && time >-1) {
            const interval = setInterval(() => {
                settime(time - 1)
                // console.log(Math.floor(time / 60) + " : " + time % 60);
                // console.log(time); 
            }, 1000);
            return (
                ()=>clearInterval(interval)
            )
        }
        
    }, [isSubmitting, time])

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        AI Mock Test
                    </h1>
                    {time > 0 && isSubmitting && (
                        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-md border border-slate-700">
                            <Clock className="h-5 w-5 text-amber-400" />
                            <span className="text-lg font-mono text-amber-400">{formatTime(time)}</span>
                        </div>
                    )}
                </header>

                {/* Results Summary Card (visible when test completed) */}
                {time === -1 && (
                    <Card className="mb-6 bg-slate-800 border-slate-700 overflow-hidden">
                        <CardHeader className="bg-slate-750 pb-2">
                            <CardTitle className="flex items-center text-xl text-amber-300">
                                <Award className="h-5 w-5 mr-2" />
                                Test Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-4 flex flex-col items-center">
                                <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                                    {right}/{right + wrong}
                                </div>
                                <div className="h-2 w-full max-w-xs bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500" 
                                        style={{ width: `${(right / (right + wrong || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-slate-700/50 p-3 rounded-md">
                                    <p className="text-sm text-slate-400">Total</p>
                                    <p className="text-lg font-semibold">{right + wrong}</p>
                                </div>
                                <div className="bg-green-900/30 p-3 rounded-md">
                                    <p className="text-sm text-green-400">Correct</p>
                                    <p className="text-lg font-semibold text-green-400">{right}</p>
                                </div>
                                <div className="bg-red-900/30 p-3 rounded-md">
                                    <p className="text-sm text-red-400">Wrong</p>
                                    <p className="text-lg font-semibold text-red-400">{wrong}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Test Configuration Form */}
                <Card className="mb-6 bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="programming-languages" className="text-sm font-medium text-slate-300">
                                        Select Test Type
                                    </label>
                                    <select 
                                        id="programming-languages" 
                                        name="test" 
                                        value={mocktest.test} 
                                        onChange={changevalue}
                                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select a test --</option>
                                        <option value={`java prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>Java</option>
                                        <option value={`python prgramming test, refer following question for the test: [${text}].(contain requrired space, next line etc)`}>Python</option>
                                        <option value={`javascript prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>JavaScript</option>
                                        <option value={`C++ prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>C++</option>
                                        <option value="logical simple to hard question all type">Logical</option>
                                        <option value="quantative simple to hard question all type">Quantitative</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="inputTime" className="text-sm font-medium text-slate-300">
                                        Test Duration: <span className="text-amber-400 font-mono">{formatTime(time)}</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="range" 
                                            id="inputTime" 
                                            name="time" 
                                            min="0" 
                                            max="40" 
                                            onChange={handletime}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || mocktest.test === "" || time === 0}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isSubmitting ? "Test In Progress..." : "Start Test"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Questions Section */}
                <div className="space-y-6 mb-24">
                    {string.length > 0 && string.map((str, i) => (
                        <Card key={i} className="bg-slate-800 border-slate-700 shadow-lg overflow-hidden">
                            <CardHeader className="bg-slate-750/50 border-b border-slate-700 pb-3">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg text-slate-200">Question {i + 1}</CardTitle>
                                    {time > 0 && isSubmitting && (
                                        <div className="text-xs bg-slate-700 px-2 py-1 rounded-md">
                                            <Clock className="h-3 w-3 inline mr-1 text-amber-400" />
                                            <span className="text-amber-400">{formatTime(time)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {/* Question */}
                                <div 
                                    className="text-sm md:text-base font-medium p-3 bg-slate-700/50 rounded-md" 
                                    dangerouslySetInnerHTML={{ __html: str.question }} 
                                    style={{ whiteSpace: "pre-wrap" }}
                                />
                                
                                {/* Options */}
                                <div className="mt-4 space-y-2">
                                    {str["choosed option"] !== '' ? (
                                        // Already answered question view
                                        <div className="space-y-2">
                                            {str.options.map((option, index) => (
                                                <div key={index} className={`
                                                    relative p-3 rounded-md border transition-all
                                                    ${option === str['correct option'] 
                                                        ? 'bg-green-900/30 border-green-500/50 text-green-200' 
                                                        : option === str['choosed option'] && option !== str['correct option']
                                                            ? 'bg-red-900/30 border-red-500/50 text-red-200'
                                                            : 'bg-slate-700/30 border-slate-600/50 text-slate-300'}
                                                `}>
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {option === str['correct option'] ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : option === str['choosed option'] && option !== str['correct option'] ? (
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border border-slate-500"></div>
                                                            )}
                                                        </div>
                                                        <div 
                                                            className="flex-grow text-sm"
                                                            dangerouslySetInnerHTML={{ __html: option }} 
                                                            style={{ whiteSpace: "pre-wrap" }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <div className="mt-4 p-4 rounded-md bg-slate-700/30 border border-slate-600">
                                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    {str["choosed option"] === str['correct option'] ? (
                                                        <>
                                                            <Check className="h-4 w-4 text-green-500" />
                                                            <span className="text-green-400">Correct Answer</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                                            <span className="text-red-400">Incorrect Answer</span>
                                                        </>
                                                    )}
                                                </h3>
                                                <div className="text-sm text-slate-300">
                                                    <p className="font-semibold text-slate-200 mb-1">Explanation:</p>
                                                    <p>{str['Explain']}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Unanswered question form
                                        <form onSubmit={handleSubmit2} className="space-y-3">
                                            {str.options.map((option, index) => (
                                                <label key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 border border-slate-600 rounded-md cursor-pointer hover:bg-slate-700/50 transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name="answer" 
                                                        value={option} 
                                                        onChange={changevalue1}
                                                        className="mt-1"
                                                    />
                                                    <div 
                                                        className="text-sm"
                                                        dangerouslySetInnerHTML={{ __html: option }} 
                                                        style={{ whiteSpace: "pre-wrap" }}
                                                    />
                                                </label>
                                            ))}
                                            
                                            {time !== -1 && (
                                                <Button 
                                                    type="submit" 
                                                    disabled={!showresult}
                                                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Submit Answer
                                                </Button>
                                            )}
                                        </form>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Fixed Bottom Bar */}
                {time !== -1 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent pt-12 pb-4">
                        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
                            {time > 0 && isSubmitting && (
                                <div className="hidden md:flex items-center gap-2 bg-slate-800/90 px-3 py-2 rounded-md">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                    <span className="text-amber-400 font-mono">{formatTime(time)}</span>
                                </div>
                            )}
                            
                            <Button 
                                onClick={handleSubmit1} 
                                disabled={!isSubmitting} 
                                size="lg"
                                className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Next Question
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // return (
    //     <div className='relative pb-20 min-h-screen flex flex-col'>
    //         <div className='grid grid-cols-8 md:grid-cols-8'>
    //             <div className=""></div>
    //             <div className='grid col-span-5 ps-10 md:col-span-6 text-xl md:text-4xl m-4 font-bold  justify-items-center'>AI Mocktest</div>
    //             {time > 0 && isSubmitting ?
    //                 <div className='text-xs md:text-4xl grid col-span-2 md:col-span-1 gap-4 content-around m-4 font-bold'>{`${Math.floor(time / 60)} : ${time % 60}min`}</div>
    //                 : ""}
    //         </div>
    //         {time===-1?
    //         <div className=' justify-items-center p-5'>
    //             <div className=" max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

    //                 <h5 className="mb-2 text-xl md:2xl font-bold tracking-tight text-gray-900 grid justify-items-center dark:text-white">Your Score:{right}/{right + wrong}</h5>
    //                 <div className="font-normal text-sm md:lg text-center grid gap-x gap-y grid-cols-3 text-gray-700 dark:text-gray-400"><span>Total Question:{right + wrong}</span> <span>Right:{right}</span> <span>Wrong:{wrong}</span></div>
    //             </div>
    //         </div>:""
    //         }

    //         <div className="bg-gray-700 p-3 px-7 m-3 rounded-lg shadow-md grid justify-items-center" id='From'>
    //             <form className='grid md:grid-cols-3 gap-3 md:gap-8 md:justify-items-center md:flex md:items-center' onSubmit={handleSubmit}>
    //                 {/* <label htmlFor="inputText">Mock Test:</label>
    //                 <input type="text" className="text-black" id="inputText" name="test" value={mocktest.test} onChange={changevalue} /> */}
    //                 <div className=''>
    //                 <label htmlFor="programming-languages" className='md:text-xl'>Choose a Test:</label>
    //                     <select className="text-black w-[4cm] md:w-[6cm]" id="programming-languages" name="test" value={mocktest.test} onChange={changevalue}>
    //                         <option value={`java prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>Java</option>
    //                         <option value={`python prgramming test, refer following question for the test: [${text}].(contain requrired space, next line etc)`}>Python</option>
    //                         <option value={`javascript prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>JavaScript</option>
    //                         <option value={`C++ prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>C++</option>
    //                         <option value="logical simple to hard question all type">Logical</option>
    //                         <option value="quantative simple to hard question all type">Quantative</option>
    //                     </select>
    //                 </div>
    //                 {/* <label htmlFor="inputquestion">No of Question:</label>
    //                 <input type="range" className="text-black" id="inputquestion" name="question" min="0" max="20" value={mocktest.question} onChange={changevalue} /> */}
    //                 <div className=''>
    //                     <label htmlFor="inputTime" className='md:text-xl'>Test duration({Math.floor(time / 60) + " : " + time % 60} min):</label>
    //                     <input type="range" className="text-black w-[4cm] md:w-[6cm]" id="inputTime" name="time" min="0" max="40" onChange={handletime} />
    //                 </div>

    //                 {/* <p>You typed: {mocktest.test} {mocktest.question}</p> */}
    //                 {/* <p>{Math.floor(time / 60) + " : " + time % 60}min</p> */}
    //                 <button className={`md:w-22 md:h-10 w-[3cm] h-9 md:text-[16px] text-sm grid px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`} type="submit" disabled={isSubmitting}>
    //                     button
    //                 </button>
    //             </form>
    //             {/* <div className='' dangerouslySetInnerHTML={{ __html: string }} style={{ "whiteSpace": "pre-wrap", }}></div> */}
    //             {/* <div className='' dangerouslySetInnerHTML={{ __html: option }} style={{ "whiteSpace": "pre-wrap", }}></div> */}


    //         </div>
    //         <div>
    //             {
    //                 string.length < 1 ? "" :
    //                     string.map((str, i) => {
    //                         return (
    //                             <div key={i} className='bg-gray-600 mx-6 pt-4 p-3 mt-10 rounded-[0.6cm] shadow-2xl'>
    //                                 <div className='m-2 italic text-zinc-50 text-[0.75rem]  md:text-[0.8rem]' dangerouslySetInnerHTML={{ __html: str.question }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                 <hr className='' />
    //                                 {/* <div className='' dangerouslySetInnerHTML={{ __html: option }} style={{ "whiteSpace": "pre-wrap", }}></div> */}
    //                                 {
    //                                     str["choosed option"] != '' ?
    //                                         <div className=''>
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.9rem]'>
    //                                                 <input type="radio" name="answer" checked={str.options[0] === str['choosed option']} value={str.options[0]} onChange={changevalue1} />
    //                                                 <div className={` ${(str.options[0] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[0] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.9rem]'>
    //                                                 <input type="radio" name="answer" checked={str.options[1] === str['choosed option']} value={str.options[1]} onChange={changevalue1} />
    //                                                 <div className={`${(str.options[1] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[1] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" checked={str.options[2] === str['choosed option']} value={str.options[2]} onChange={changevalue1} />
    //                                                 <div className={`${(str.options[2] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[2] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" checked={str.options[3] === str['choosed option']} value={str.options[3]} onChange={changevalue1} />
    //                                                 <div className={`${(str.options[3] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[3] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             {str["choosed option"] == str['correct option'] ? <p className='text-green-600 text-xl font-semibold m-2'>Correct</p> : <p className='text-red-600 text-xl font-semibold m-2'>Wrong</p>}
    //                                             <span className='text-slate-50 text-xl font-semibold m-2'>Explaination :</span><span>{str['Explain']}</span>
    //                                         </div>
    //                                         :
    //                                         <form onSubmit={handleSubmit2}>
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" value={str.options[0]} onChange={changevalue1} />
    //                                                 <p className='' dangerouslySetInnerHTML={{ __html: str.options[0] }} style={{ "whiteSpace": "pre-wrap", }}></p>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" value={str.options[1]} onChange={changevalue1} />
    //                                                 <div className='' dangerouslySetInnerHTML={{ __html: str.options[1] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" value={str.options[2]} onChange={changevalue1} />
    //                                                 <div className='' dangerouslySetInnerHTML={{ __html: str.options[2] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
    //                                                 <input type="radio" name="answer" value={str.options[3]} onChange={changevalue1} />
    //                                                 <div className='' dangerouslySetInnerHTML={{ __html: str.options[3] }} style={{ "whiteSpace": "pre-wrap", }}></div>
    //                                             </label>
    //                                             <hr />
    //                                             {time===-1?"":
    //                                             <button disabled={!showresult} className='bg-blue-700 m-2 mx-5 text-xl p-1 border-slate-50 rounded-lg border-2 border-slate-50' type="submit">Submit</button>
    //                                             }
    //                                         </form>

    //                                 }
    //                             </div>
    //                         )
    //                     })
    //             }
    //         </div>
    //         {time===-1?
    //         <div className=' justify-items-center p-5'>
    //             <div className=" max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

    //                 <h5 className="mb-2 text-xl md:2xl font-bold tracking-tight text-gray-900 grid justify-items-center dark:text-white">Your Score:{right}/{right + wrong}</h5>
    //                 <div className="font-normal text-sm md:lg text-center grid gap-x gap-y grid-cols-3 text-gray-700 dark:text-gray-400"><span>Total Question:{right + wrong}</span> <span>Right:{right}</span> <span>Wrong:{wrong}</span></div>
    //             </div>
    //         </div>:
    //         <div className='absolute bottom-0 w-full mb-2 grid grid-cols-8 justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
    //             <div></div>
    //             <button type="button" disabled={!isSubmitting} onClick={handleSubmit1} className="grid col-span-6 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Next</button>
    //             {time > 0 && isSubmitting ?
    //                 <div className='text-sm grid gap-4 content-around font-bold'>{Math.floor(time / 60) + " : " + time % 60}min</div>
    //                 : ""}
    //             {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
    //         </div>
    //         }
    //         <div>

    //         </div>
    //     </div>
    // )
}

export default Aptitude