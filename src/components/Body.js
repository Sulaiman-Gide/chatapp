import React from 'react'
import { useState } from "react";
import { FormControl, Input, Button } from "@chakra-ui/react";
import SendIcon from '@mui/icons-material/Send';

function Body() {


  return (
    <div className='h-screen p-3 cursor-pointer dark:bg-black select-none'>
      <div className='bg-slate-50/25 dark:bg-gray-900  shadow-md rounded-lg h-full flex justify-center items-center px-2'>
        <h1 className='font-serif text-center font-semibold text-base md:text-3xl dark:text-slate-50'>Click on the plus icon to start a new conversation, or click on a number to open a conversation.</h1>
      </div>
    </div>
  )
}

export default Body