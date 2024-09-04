// import Interview from '@/components/Interview'
import Communication from '@/components/Communication'
import Consultant from '@/components/Consultant'
import Interview from '@/components/Interview'
import { notFound } from 'next/navigation'
import React from 'react'
const Service =async ({params}) => {
    if(params.service=="Interview"){
        return(<Interview/>)
    }
    else if(params.service=="Communication"){
        return(<Communication/>)
    }
    else if(params.service=="Consultant"){
        return(<Consultant/>)
    }
    else{
        return notFound()
    }
}

export default Service