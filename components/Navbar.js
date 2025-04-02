"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import { useModal } from "@/context/ModalContext"
import { redirect } from 'next/navigation'
const Navbar = () => {
    const [key, setKey] = useState("")
    const [email, setEmail] = useState("");
    const [nameNav, setNameNav] = useState("")
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [color, setColor] = useState("")
    // const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const { showLoginModal, setShowLoginModal, showQuickModal, setShowQuickModal } = useModal();

    useEffect(() => {
        
        if (localStorage.getItem('Skey')) {
            setKey(localStorage.getItem('Skey'))
            setNameNav(localStorage.getItem('name'))
        }

        if (localStorage.getItem('token') && localStorage.getItem('name')) {
            setIsLoggedIn(true);
            setEmail(localStorage.getItem('email'))
            setName(localStorage.getItem('name'))
        } else {
            setIsLoggedIn(false); // Ensure it's explicitly set to false if not logged in
        }

    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch('/api/ValidateKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: key }),
        });
        if (response.ok) {
            localStorage.setItem("Skey", key)
            alert("Valid key")
            setColor("green")
        }
        else {
            setColor("red")
            alert("Invalid key")
        }
    }

    const handleRegistration = async (e) => {
        e.preventDefault()
        
        try {
            const response = await fetch("/api/Auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "register",
                    email,
                    password,
                    name,
                    SKey: key // Using SKey instead of key to match backend
                }),
            })

            const data = await response.json()

            if (response.ok) {
                alert("Registration successful! Please login.")
                // setIsRegistering(false)
                // Clear form fields
                setEmail("")
                setPassword("")
                setName("")
                setKey("")

                window.location.reload();

            } else {
                alert(data.message || "Registration failed")
            }
        } catch (error) {
            console.error("Registration error:", error)
            alert("An error occurred during registration")
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        
        try {
            const response = await fetch("/api/Auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login",
                    email,
                    password
                }),
            })

            const data = await response.json()
            
            if (response.ok) {
                alert("Login successful!")
                localStorage.setItem("token", data.token)
                localStorage.setItem("Skey", data.Skey)
                localStorage.setItem("name", data.name)
                localStorage.setItem("email", data.email)
                setToken(data.token)
                // Clear form fields
                setEmail("")
                setPassword("")

                // Reload the page
                window.location.reload();
            } else {
                alert(data.message || "Login failed")
            }
        } catch (error) {
            console.error("Login error:", error)
        }
    }

    const handleLogout = async (e) =>{
            localStorage.removeItem("token")
            localStorage.removeItem("Skey")
            localStorage.removeItem("name")
            alert("Logged out Successfully")
            // Reload the page
            window.location.reload();
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch('/api/Auth', { 
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email,     
                    name: name,       
                    SKey: key,        
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
                // Optionally update localStorage with new name if changed
                if (name) {
                    localStorage.setItem('name', name);
                    setNameNav(name); // Update Navbar's displayed name if needed
                }
                // Optionally clear password field
                setPassword("");

                // Optionally close the modal after successful update
                // document.getElementById('authentication-modal-edit').style.display = 'none'; // Directly hide (less React-y)
                 window.location.reload();
            } else {
                alert(data.message || 'Failed to update profile.');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile.');
        }
    };


    return (
        <nav className="bg-white border-gray-200 fixed w-full z-20 top-0 start-0 dark:bg-gray-900 dark:border-gray-700">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Image src="https://flowbite.com/docs/images/logo.svg" height={32} width={31} alt="Flowbite Logo" />
                    {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" /> */}
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AI Based Job Cracker</span>
                </a>
                <button data-collapse-toggle="navbar-dropdown" type="button" className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600`} aria-controls="navbar-dropdown" aria-expanded="false" >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <a href="/" className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" aria-current="page">Home</a>
                        </li>
                        <li>
                            <button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar" type="button" className={`flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent`}>Services <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg></button>

                            <div id="dropdownNavbar" className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownLargeButton">
                                    <li>
                                        <a href="/Interview" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Interview</a>
                                    </li>
                                    <li>
                                        <a href="/Communication" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Communication</a>
                                    </li>
                                    <li>
                                        <a href="/Chatbot" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Chatbot</a>
                                    </li>
                                    <li>
                                        <a href="/Aptitude" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Aptitude</a>
                                    </li>
                                    <li>
                                        <a href="/FileProcessing" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">File Processing</a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li>
                            <a href="#" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</a>
                        </li>

                        <li>
                            <button id="dropdownNavbarLink1" data-dropdown-toggle="dropdownNavbar1" type="button" className={`flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent`}>
                                {name?name.split(" ")[0]:"User"}
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg></button>

                            <div id="dropdownNavbar1" className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownLargeButton">
                                    <li>
                                        <button data-modal-target="authentication-modal-register" data-modal-toggle="authentication-modal-register" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" type="button">
                                            Register
                                        </button>
                                    </li>
                                    <li>
                                        <button data-modal-target="authentication-modal-login" data-modal-toggle="authentication-modal-login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" type="button">
                                            Login
                                        </button>
                                    </li>
                                    <li>
                                        <button data-modal-target="authentication-modal-edit" data-modal-toggle="authentication-modal-edit" className={`${isLoggedIn?"block":"hidden"} px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`} type="button">
                                            Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button className={`${isLoggedIn?"block":"hidden"} px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`} onClick={handleLogout} type="button">
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li>
                            {/* <!-- Modal toggle --> */}
                            <button data-modal-target="authentication-modal" data-modal-toggle="authentication-modal" className="block py-2 mt-1 mb-1 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" type="button">
                                <div className='relative'>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20.57" width="22.25" viewBox="0 0 448 512"><path fill="#74C0FC" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" /></svg>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            {/* <!-- Main modal --> */}
            <div id="authentication-modal" tabIndex="-1" aria-hidden="true" className={`${showQuickModal?"flex":"hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full backdrop-blur-sm`}>
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Please Add Your Gemini Key
                            </h3>
                            <button type="button" onClick={() => setShowQuickModal(false)} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div className="p-4 md:p-5">
                            <form className="space-y-4" action="#">
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Key</label>
                                    <input type="text" name="Skey" id="Skey" value={name&&key?"":key} onChange={(e) => { setKey(e.target.value) }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="AIzaSyDtGMphqJpLrymEWq4XA3zSWT9i6AVLyEs" required />
                                </div>
                                <button type="submit" onClick={handleSubmit} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Key</button>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                                    Not Having Key? <a href="https://aistudio.google.com/app/apikey" target='_blank' className="text-blue-700 hover:underline dark:text-blue-500">Create Key</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Modal */}
            <div id="authentication-modal-register" tabIndex="-1" aria-hidden="true" className={`hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full backdrop-blur-sm`}>
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Register
                            </h3>
                            <button type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal-register">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div class="p-4 md:p-5">
                            <form class="space-y-4" onSubmit={handleRegistration} action="#">
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input type="email" name="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required />
                                </div>
                                <div class="col-span-2">
                                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                    <input type="text" name="name" id="name" value={name} onChange={(e)=>{setName(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" required="" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Key</label>
                                    <input type="text" name="Skey" id="Skey" value={key} onChange={(e) => { setKey(e.target.value) }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="AIzaSyDtGMphqJpLrymEWq4XA3zSWT9i6AVLyEs" required />
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                                    <input type="password" name="password" id="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                                </div>
                                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create your account</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            <div id="authentication-modal-login" tabIndex="-1" aria-modal={showLoginModal ? "true" : "false"}
        role="dialog"  className={`${showLoginModal?"flex":"hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full backdrop-blur-sm`}>
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                login
                            </h3>
                            <button type="button" onClick={() => setShowLoginModal(false)} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                            data-modal-hide="authentication-modal-login">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div class="p-4 md:p-5">
                            <form class="space-y-4" onSubmit={handleLogin}>
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input type="email" name="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required />
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                                    <input type="password" name="password" id="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                                </div>
                                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login to your account</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}

            <div id="authentication-modal-edit" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full backdrop-blur-sm">
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Edit Profile
                            </h3>
                            <button type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal-edit">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div class="p-4 md:p-5">
                            <form class="space-y-4" onSubmit={handleEditSubmit}>  {/* Replace with your submit handler */}
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input type="email" name="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com"/>
                                </div>
                                <div class="col-span-2">
                                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                    <input type="text" name="name" id="name" value={name} onChange={(e)=>{setName(e.target.value)}} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Key</label>
                                    <input type="text" name="Skey" id="Skey" value={key} onChange={(e) => { setKey(e.target.value) }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="AIzaSyDtGMphqJpLrymEWq4XA3zSWT9i6AVLyEs"  />
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                                    <input type="password" name="password" id="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" />
                                </div>
                                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update Profile</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <script src="https://unpkg.com/flowbite@1.6.0/dist/flowbite.js" async />
        </nav>

    )
}

export default Navbar