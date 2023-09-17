import { useState, useEffect } from "react";
import {motion} from 'framer-motion';
import { Inter } from 'next/font/google'
import Chat from '../components/Chat';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import PhoneInput from 'react-phone-input-2'
import "react-phone-input-2/lib/style.css";
import { auth, db, storage  } from "../components/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import Spinner from 'react-bootstrap/Spinner';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import {
  doc,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "react-toastify/dist/ReactToastify.css";
import { FiDivideCircle } from "react-icons/fi";

const inter = Inter({ subsets: ['latin'] })
const userInputs = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "john_wick",
  },
  {
    id: "name",
    label: "First Name",
    type: "text",
    placeholder: "John",
  },
  {
    id: "secondName",
    label: "Second Name",
    type: "text",
    placeholder: "Wick",
  },
];
export default function Home(props) {

  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, []);

  const [logo, setLogo] = useState(true);
  const [login, setLogin] = useState(false);
  const [home, setHome] = useState(false);
  const [chat, setChat] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLogo(false)
      setLogin(true)
    }, 4000);
  }, []);

  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneNumb, setPhoneNumb] = useState("")
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [per, setPerc] = useState(null);
  const [submitBtn, setSubmitBtn] = useState(true);

  const [users, setUsers] = useState("");
    
  const formatPh = "+" + ph;
  const docRef = doc(db, "usersdb", formatPh ); 
  const get = async () => {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const newData = docSnap.data();
      setUsers(newData)
    }
  };
  get(); 



  const handleChange = (element, index) => {
      if (isNaN(element.value)) return false;

      setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

      //Focus next input
      if (element.nextSibling) {
          element.nextSibling.focus();
      }
  };

  // Input and Verification Number Configuration
  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // ...
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
        }
      });
    }
  }

  function onSignup() {
    setLoading(true);
    onCaptchVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+" + ph;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sent successfully!");
      })
      .catch((error) => {
        alert(error);
        setLoading(false);
        toast.error("Network Error: Refresh Page");
      });
  }

  // Verify OTP Configuration
  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp.join(""))
      .then(async (res) => {
        setUser(res.user);
        setPhoneNumb(res.user.phoneNumber);
        setLoading(false);
        setLogin(false);
        const formatPh = "+" + ph;
        const docRef = doc(db, "usersdb", formatPh ); 
        const getUsers = async () => {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setChat(true)
          } else {
            // docSnap.data() will be undefined in this case
            setHome(true);
          }
        };
        getUsers();    
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        toast.error("Invalid verification code");
      });
  }

  // Registration Configuration
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;

      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, image: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);
  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({ ...data, [id]: value });
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
      try {
        const formatPh = "+" + ph;
        await setDoc(doc(db, "usersdb", formatPh), {
          ...data,
          phone: formatPh,
          timeStamp: serverTimestamp(),
        });
        get();
        setLoading(false);         
        setSubmitBtn(false)
        toast.success("Account created successfully!");
        setHome(false)
        setChat(true)
    } catch (err) {
        setLoading(false);
        console.log(err)
        toast.error("Network Error: Please refresh page");
      }
  };


  return (
    <main className="min-h-screen">
    {isClient ?
      <>
        <section className={`${logo ? "" : "d-none"}`}>
          <div
            className="h-screen flex items-center justify-center cursor-wait">

          <img className='relative p-0 rounded-full h-40 w-40 md:h-60 md:w-60 mx-auto object-cover' src='/logo_3.jpg' alt=''/>

          </div>
        </section>

        <section className={`${ login ? "" : "d-none"}`}>
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 0.2, 0.4, 0.5, 0.8, 0.9, 1.0]
              }}
              transition={{ duration: 1 }}
          >
            <section className="flex items-center justify-center h-screen">
              <div>
                <Toaster toastOptions={{ duration: 4000 }} position="top-right" />
                <div id="recaptcha-container"></div>
                  <div className="w-screen h-screen">
                    {showOTP ? (
                      <div className='w-full h-full flex justify-center items-center flex-col'>
                        <div className="mx-auto rounded-full">
                          <img className='relative rounded-full h-20 w-32 md:w-52 md:h-40 mb-2 mx-auto object-cover border-2 border-gray-200' src='/logo_2.jpg' alt=''/>
                        </div>
                        <label
                          htmlFor="otp"
                          className="font-bold text-2xl text-center my-3 font-serif"
                        >
                          Enter Your OTP
                        </label>
                        <div className='mb-1'>
                        {otp.map((data, index) => {
                          return (
                              <input
                                className="w-8 mx-1 sm:mx-2 border-2 bg-gray-100 text-center"
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onFocus={e => e.target.select()}
                              />
                            );
                        })}
                        </div>
                        <button
                          onClick={onOTPVerify}
                          className="button"
                        >
                          {loading && (
                              <Spinner animation="border" size="sm" />
                          )}
                          <span className='px-2'>Verify OTP</span>
                        </button>
                      </div>
                    ) : (
                      <div className='w-full h-screen flex justify-center items-center flex-col'>
                        <img className='relative rounded-full h-20 w-32 md:w-52 md:h-40 mb-2 mx-auto object-cover border-2 border-gray-200' src='/logo_2.jpg' alt=''/>
                        <h1
                          className="font-bold text-2xl text-center mt-3 mb-1 font-serif"
                        >
                          Enter your phone number
                        </h1>
                        <p className="text-base text-center font-serif">You will receive a 6 digit code for phone number verification</p>
                        <div className="flex justify-center items-center">
                          <PhoneInput  
                            className='phone-input-no-outline'
                            country={"ng"} 
                            value={ph} 
                            onChange={setPh}
                          />
                        </div>
                        <button
                          onClick={onSignup}
                          className="button"
                        >
                          {loading && (
                            <Spinner animation="border" size="sm" />
                          )}
                          <span className='px-2'> Send code via SMS</span>
                        </button>
                      </div>
                    )}
                  </div>
              </div>
            </section>
          </motion.div>
        </section>
        <section className={`${ home ? "" : "d-none"}`}>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Toaster toastOptions={{ duration: 4000 }} />
              <div className="w-screen md:h-screen flex justify-center items-center flex-col p-2 md:px-5 select-none">
              <div className="top w-full px-5 py-3 mb-5">
                <h1 className="text-base lg:text-xl cursor-pointer">CREATE AN ACCOUNT</h1>
              </div>
              <div className="bottom flex flex-wrap p-5 flex-col md:flex-row">
                <div className="md:border p-2 flex justify-center items-center flex-auto md:w-1/3 w-full md:mb-0 mb-4 rounded-md">
                  <img
                    src={
                      file
                        ? URL.createObjectURL(file)
                        : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                    }
                    alt=""
                    className='relative rounded-full h-40 w-40 md:h-60 md:w-60 object-cover'
                  />
                </div>
                <div className="right flex-auto md:w-2/3 w-full pt-2">
                  <form onSubmit={handleAdd}>
                    <div className="formInput w-full sm:w-2/5">
                      <label htmlFor="file">
                        Image: <DriveFolderUploadOutlinedIcon className="w-5 h-5" />
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ display: "none" }}
                      />
                    </div>
      
                    {userInputs?.map((input) => (
                      <div className="formInput w-full flex flex-wrap sm:w-2/5" key={input.id}>
                        <label>{input.label}</label>
                        <input
                          id={input.id}
                          type={input.type}
                          placeholder={input.placeholder}
                          onChange={handleInput}
                        />
                      </div>
                    ))}
                    <div className="w-full flex justify-center items-center">
                      <button disabled={per !== null && per < 100} type="submit" className={`${submitBtn ? "" : "d-none"}`}>
                        {loading && (
                            <Spinner animation="border" size="sm" />
                        )}
                        <span className='px-3'>Register</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className={`${ chat ? "" : "d-none"}`}>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
          <Chat />
          </motion.div>
        </section>
      </> 
    : <></>
    }
    </main>
  )
}