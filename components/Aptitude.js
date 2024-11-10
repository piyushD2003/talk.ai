"use client"
import React, { useEffect, useState } from 'react'
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
    }, [])

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
            if (result) {
                setChatHistory([...chatHistory, { role: "model", parts: [{ text: result.AiResponse }], }])
            }
            // result = result.replace(/\n/g, '<br>');
            let j = JSON.parse(result.AiResponse)
            console.log(j);
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

        }";2)Ensure the response is strictly in JSON format without any markdown, 'json', or backticks. Only output valid JSON. 3)You only have to give the question nothing else. 4) This response i.e "user" is my last after that is not avaliable. 5)choosed should be empty in starting. 6)In options, right answer should be random not only in first place, REMEBER THAT! 7) In Explain: must and compulsory provide information why correct option is correct(in brief) Mandatory`

    }, [isSubmitting])

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

    return (
        <div className='relative pb-20 min-h-screen flex flex-col'>
            <div className='grid grid-cols-8 md:grid-cols-8'>
                <div className=""></div>
                <div className='grid col-span-5 ps-10 md:col-span-6 text-xl md:text-4xl m-4 font-bold  justify-items-center'>AI Mocktest</div>
                {time > 0 && isSubmitting ?
                    <div className='text-xs md:text-4xl grid col-span-2 md:col-span-1 gap-4 content-around m-4 font-bold'>{`${Math.floor(time / 60)} : ${time % 60}min`}</div>
                    : ""}
            </div>
            {time===-1?
            <div className=' justify-items-center p-5'>
                <div className=" max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                    <h5 className="mb-2 text-xl md:2xl font-bold tracking-tight text-gray-900 grid justify-items-center dark:text-white">Your Score:{right}/{right + wrong}</h5>
                    <div className="font-normal text-sm md:lg text-center grid gap-x gap-y grid-cols-3 text-gray-700 dark:text-gray-400"><span>Total Question:{right + wrong}</span> <span>Right:{right}</span> <span>Wrong:{wrong}</span></div>
                </div>
            </div>:""
            }

            <div className="bg-gray-700 p-3 px-7 m-3 rounded-lg shadow-md grid justify-items-center" id='From'>
                <form className='grid md:grid-cols-3 gap-3 md:gap-8 md:justify-items-center md:flex md:items-center' onSubmit={handleSubmit}>
                    {/* <label htmlFor="inputText">Mock Test:</label>
                    <input type="text" className="text-black" id="inputText" name="test" value={mocktest.test} onChange={changevalue} /> */}
                    <div className=''>
                    <label htmlFor="programming-languages" className='md:text-xl'>Choose a Test:</label>
                        <select className="text-black w-[4cm] md:w-[6cm]" id="programming-languages" name="test" value={mocktest.test} onChange={changevalue}>
                            <option value={`java prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>Java</option>
                            <option value={`python prgramming test, refer following question for the test: [${text}].(contain requrired space, next line etc)`}>Python</option>
                            <option value={`javascript prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>JavaScript</option>
                            <option value={`C++ prgramming test, refer following question for the test: [${text}]. it should contain actual code (contain requrired space, next line etc)`}>C++</option>
                            <option value="logical simple to hard question all type">Logical</option>
                            <option value="quantative simple to hard question all type">Quantative</option>
                        </select>
                    </div>
                    {/* <label htmlFor="inputquestion">No of Question:</label>
                    <input type="range" className="text-black" id="inputquestion" name="question" min="0" max="20" value={mocktest.question} onChange={changevalue} /> */}
                    <div className=''>
                        <label htmlFor="inputTime" className='md:text-xl'>Test duration({Math.floor(time / 60) + " : " + time % 60} min):</label>
                        <input type="range" className="text-black w-[4cm] md:w-[6cm]" id="inputTime" name="time" min="0" max="40" onChange={handletime} />
                    </div>

                    {/* <p>You typed: {mocktest.test} {mocktest.question}</p> */}
                    {/* <p>{Math.floor(time / 60) + " : " + time % 60}min</p> */}
                    <button className={`md:w-22 md:h-10 w-[3cm] h-9 md:text-[16px] text-sm grid px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`} type="submit" disabled={isSubmitting}>
                        button
                    </button>
                </form>
                {/* <div className='' dangerouslySetInnerHTML={{ __html: string }} style={{ "whiteSpace": "pre-wrap", }}></div> */}
                {/* <div className='' dangerouslySetInnerHTML={{ __html: option }} style={{ "whiteSpace": "pre-wrap", }}></div> */}


            </div>
            <div>
                {
                    string.length < 1 ? "" :
                        string.map((str, i) => {
                            return (
                                <div key={i} className='bg-gray-600 mx-6 pt-4 p-3 mt-10 rounded-[0.6cm] shadow-2xl'>
                                    <div className='m-2 italic text-zinc-50 text-[0.75rem]  md:text-[0.8rem]' dangerouslySetInnerHTML={{ __html: str.question }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                    <hr className='' />
                                    {/* <div className='' dangerouslySetInnerHTML={{ __html: option }} style={{ "whiteSpace": "pre-wrap", }}></div> */}
                                    {
                                        str["choosed option"] != '' ?
                                            <div className=''>
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.9rem]'>
                                                    <input type="radio" name="answer" checked={str.options[0] === str['choosed option']} value={str.options[0]} onChange={changevalue1} />
                                                    <div className={` ${(str.options[0] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[0] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.9rem]'>
                                                    <input type="radio" name="answer" checked={str.options[1] === str['choosed option']} value={str.options[1]} onChange={changevalue1} />
                                                    <div className={`${(str.options[1] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[1] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" checked={str.options[2] === str['choosed option']} value={str.options[2]} onChange={changevalue1} />
                                                    <div className={`${(str.options[2] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[2] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" checked={str.options[3] === str['choosed option']} value={str.options[3]} onChange={changevalue1} />
                                                    <div className={`${(str.options[3] === str['correct option']) ? 'bg-green-500' : ''} `} dangerouslySetInnerHTML={{ __html: str.options[3] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                {str["choosed option"] == str['correct option'] ? <p className='text-green-600 text-xl font-semibold m-2'>Correct</p> : <p className='text-red-600 text-xl font-semibold m-2'>Wrong</p>}
                                                <span className='text-slate-50 text-xl font-semibold m-2'>Explaination :</span><span>{str['Explain']}</span>
                                            </div>
                                            :
                                            <form onSubmit={handleSubmit2}>
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem] md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" value={str.options[0]} onChange={changevalue1} />
                                                    <p className='' dangerouslySetInnerHTML={{ __html: str.options[0] }} style={{ "whiteSpace": "pre-wrap", }}></p>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" value={str.options[1]} onChange={changevalue1} />
                                                    <div className='' dangerouslySetInnerHTML={{ __html: str.options[1] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" value={str.options[2]} onChange={changevalue1} />
                                                    <div className='' dangerouslySetInnerHTML={{ __html: str.options[2] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                <label className='flex items-center m-2 gap-x-2 text-[0.6rem]  md:text-[0.8rem]'>
                                                    <input type="radio" name="answer" value={str.options[3]} onChange={changevalue1} />
                                                    <div className='' dangerouslySetInnerHTML={{ __html: str.options[3] }} style={{ "whiteSpace": "pre-wrap", }}></div>
                                                </label>
                                                <hr />
                                                {time===-1?"":
                                                <button disabled={!showresult} className='bg-blue-700 m-2 mx-5 text-xl p-1 border-slate-50 rounded-lg border-2 border-slate-50' type="submit">Submit</button>
                                                }
                                            </form>

                                    }
                                </div>
                            )
                        })
                }
            </div>
            {time===-1?
            <div className=' justify-items-center p-5'>
                <div className=" max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                    <h5 className="mb-2 text-xl md:2xl font-bold tracking-tight text-gray-900 grid justify-items-center dark:text-white">Your Score:{right}/{right + wrong}</h5>
                    <div className="font-normal text-sm md:lg text-center grid gap-x gap-y grid-cols-3 text-gray-700 dark:text-gray-400"><span>Total Question:{right + wrong}</span> <span>Right:{right}</span> <span>Wrong:{wrong}</span></div>
                </div>
            </div>:
            <div className='absolute bottom-0 w-full mb-2 grid grid-cols-8 justify-items-center pt-2 bg-gradient-to-r from-gray-500 to-slate-700 object-right-bottom shadow-2xl'>
                <div></div>
                <button type="button" disabled={!isSubmitting} onClick={handleSubmit1} className="grid col-span-6 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Next</button>
                {time > 0 && isSubmitting ?
                    <div className='text-sm grid gap-4 content-around font-bold'>{Math.floor(time / 60) + " : " + time % 60}min</div>
                    : ""}
                {/* <button type="button" onClick={stopRecording} disabled={!recording} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Stop Recording</button> */}
            </div>
            }
            <div>

            </div>
        </div>
    )
}

export default Aptitude