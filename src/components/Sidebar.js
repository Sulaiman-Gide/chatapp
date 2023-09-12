import React from 'react'
import { useState, useEffect } from "react";
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import ChatIcon from '@mui/icons-material/Chat'
import Search from '@mui/icons-material/Search'
import { useRouter } from 'next/navigation'
import getOtherNumber from "../utils/getOtherNumber";
import styled from 'styled-components';
import Modal from 'react-bootstrap/Modal';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Spinner from 'react-bootstrap/Spinner';
// Firebase
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import Link from 'next/link'
import ThemeSwitcher from "./ThemeSwitcher";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  query, 
  where, 
  getDocs,
  getDoc,
  orderBy,
  onSnapshot
} from "firebase/firestore";

const ScrollbarContainer = styled.div`
  width: 100%; /* Adjust the width as needed */
  height: 100%; /* Adjust the height as needed */
  overflow-y: auto;
  overflox-x: hidden;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: teal transparent; /* Firefox */

  &::-webkit-scrollbar {
    width: 5px; /* Width of the scrollbar */
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1; /* Track background color */
  }
  
  /* Thumb (the draggable part) */
  &::-webkit-scrollbar-thumb {
    background-color: teal; /* Thumb color */
    border-radius: 10px; /* Adjust the radius as needed */
  }

  /* Thumb on hover */
  &::-webkit-scrollbar-thumb:hover {
    background-color: #007F7F; /* Hovered thumb color */
  }
`;
function Sidebar() {
  const handleClose1 = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the page?");
    const chatUrl = `/`;
    
    if (userConfirmed) {
      router.push(chatUrl);
    }
  };

  const [user] = useAuthState(auth);
  const [snapshot, error] = useCollection(collection(db, "chats"), orderBy("timestamp"));
  const chats = snapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}));
  const router = useRouter();

  const redirect = (id) => {
    router.push(`/chat/${id}`);
  }

  const chatList = () => {

    if (user) {
      return (
        chats?.filter(chat => chat.users.includes(user.phoneNumber))
        .map(
          chat => 
            <div key={chat.id} onClick={() => redirect(chat.id)} className='chatList dark:bg-gray-900 shadow-sm bg-slate-50/25 flex items-center justify-start rounded-lg py-3 px-3 my-3 mr-2'>
              <img className='relative rounded-full w-10 h-10 sm:h-14 sm:w-14 object-cover' src='data:image/png;base64,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' alt=''/>
              <div className='pl-1 sm:pl-3'>
                <h1 className='text-sm md:text-2xl dark:text-slate-50'>{getOtherNumber(chat.users, user)}</h1>
              </div>
            </div>
        )
      )
    }
  }
  const [users, setUsers] = useState("");
    
  if (user) {
    const docRef = doc(db, "usersdb", user.phoneNumber ); 
    const get = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newData = docSnap.data();
        setUsers(newData)
      }
    };
    get(); 
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const [loading, setLoading] = useState(false);
  const [ph, setPh] = useState("");
  const formatPh = "+" + ph;
  const chatExists = phoneNumber => chats?.find(chat => (chat.users.includes(user.phoneNumber) && chat.users.includes(phoneNumber)))
  const newChat = async () => {
    setLoading(true);
    if (!chatExists(formatPh) && (formatPh != user.phoneNumber) && (ph.length > 4)) {
      await addDoc(collection(db, "chats"), { users: [user.phoneNumber, formatPh] })
      setPh("")
      setLoading(false);
      setShow(false)
    } else {
      setLoading(false);
    }
  }



  return (
    <section >
      <div className='h-screen flex justify-center items-center pr-3 cursor-pointer select-none dark:bg-black'>
        <div className='w-1/6 h-full shadow-md'>
          <div className='w-full h-full'>
            <div className='w-full h-full'>
              <div className='h-4/5 flex justify-center items-center flex-col'>
                <ChatIcon  className="text-2xl sm:text-3xl mt-5  dark:text-slate-50"/>
                <SettingsIcon  className="text-2xl sm:text-3xl mt-5 dark:text-slate-50"/>
                <ThemeSwitcher className="dark:text-slate-50" />
              </div>
              <div className='h-1/5 flex justify-between items-center flex-col pb-3'>
                <img className='relative rounded-full w-12 h-12 sm:h-16 sm:w-16 mx-auto object-cover border' src={users.image} alt='' />
                <PowerSettingsNewIcon onClick={handleClose1} className="text-2xl sm:text-3xl dark:text-slate-50"/>
              </div>
            </div>
          </div>
        </div>

        <div className='h-full w-5/6 flex items-center flex-col pl-3'>
          <div className='w-full flex justify-between items-center top-0 sticky pt-4 pb-3 md:pt-5 md:pb-3 mx-auto'>
            <h1 className='font-serif text-3xl md:text-2xl font-bold dark:text-slate-50'>Chats</h1>
            <Search onClick={handleShow} className="text-2xl sm:text-3xl dark:text-slate-50"/>
          </div>
          <div className='sidebarTwoChatList'>
           <ScrollbarContainer>
              {chatList()}
           </ScrollbarContainer>
          </div>
        </div>
      </div>
      <Modal show={show} size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="font-serif text-sm md:text-2xl">Input Chat Recipient Mobile</Modal.Title>
        </Modal.Header>
        <Modal.Body className='flex items-center justify-center flex-col'>
          <div className='w-full'>
            <PhoneInput country={"ng"} value={ph} onChange={setPh} className={"input-phone-number h-full"} />
          </div>
          <div>
          <button
            onClick={newChat}
            className="button my-3"
          >
            {loading && (
              <Spinner animation="border" size="sm" />
            )}
            <span className='px-2'>Add User</span>
          </button>
          </div>
        </Modal.Body>
        
      </Modal>
    </section>
  )
}

export default Sidebar