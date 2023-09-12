'use client'
import { useState, useEffect } from "react";
import {motion} from 'framer-motion';
import Chat from './Chat';

//Login imports
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import Spinner from 'react-bootstrap/Spinner';

export default function Home() {

  const [logo, setLogo] = useState(false);
  const [login, setLogin] = useState(false);
  const [home, setHome] = useState(true);

 

  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("")



  return (
    <main className="min-h-screen">
      <section className={`${logo ? "" : "d-none"}`}>
        <motion.div 
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.1, 0.5,, 1.0]
          }}
          transition={{ repeat: Infinity, duration: 1.7 }}
          className="h-screen flex items-center justify-center cursor-wait ">

         <img className='relative p-0 rounded-full h-40 w-40 md:h-60 md:w-60 mx-auto object-cover' src='/logo_3.jpg' alt=''/>

        </motion.div>
      </section>

      
      <section className={`${ home ? "" : "d-none"}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: .2 }}
        >
          <Chat />
        </motion.div>
      </section>
    </main>
  )
}
