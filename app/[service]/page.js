// import Interview from '@/components/Interview'
"use client"
import Aptitude from '@/components/Aptitude'
import Communication from '@/components/Communication'
import Chatbot from '@/components/Chatbot'
import FileProcessing from '@/components/FileProcessing'
import Interview from '@/components/Interview'
import { notFound } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'

const Service =({params}) => {
    useEffect(() => {
        if(localStorage.getItem('Skey')==null || localStorage.getItem('token')==null ){
          alert("Please Enter the key or Sign in")
          redirect("/")
        }
    }, [])
    // const [API, setAPI] = useState(null)
    // useEffect(() => {
    //     console.log(API);
        
    //     if(localStorage.getItem('Skey')){
    //         setAPI(localStorage.getItem('Skey'))
    //     }
    // }, [])

    // if(API===null){
    //     redirect('/')
    // }
    if(params.service=="Interview"){
        // if(API==null){
        //     redirect('/')
        // }
        return(<Interview/>)
    }
    else if(params.service=="Communication"){
        // if(API==null){
        //     redirect('/')
        // }
        return(<Communication/>)
    }
    else if(params.service=="Chatbot"){
        // if(API==null){
        //     redirect('/')
        // }
        return(<Chatbot/>)
    }
    else if(params.service=="Aptitude"){
        // if(API==null){
        //     redirect('/')
        // }
        return(<Aptitude/>)
    }
    else if(params.service=="FileProcessing"){
        // if(API==null){
        //     redirect('/')
        // }
        return(<FileProcessing/>)
    }
    else{
        return notFound()
    }
}

export default Service