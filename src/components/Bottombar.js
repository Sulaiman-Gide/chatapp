import { useState, useEffect } from "react";
import { FormControl } from "@chakra-ui/react";
import { serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export default function Bottombar({ id, user }) {
  const [input, setInput] = useState("");
  const [data, setData] = useState({});
  const [file, setFile] = useState(null); // Use null as the initial state
  const [per, setPerc] = useState(null);

  useEffect(() => {
    const uploadFile = async () => {
      if (file) {
        const name = new Date().getTime() + file.name;

        const storageRef = ref(storage, name); // Use a unique name
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
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setData({ downloadURL }); // Store the download URL
              sendImage(); // Send the image automatically after it's uploaded
            } catch (error) {
              console.error("Error getting download URL:", error);
            }
          }
        );
      }
    };
    uploadFile();
  }, [file]);

  const sendMessage = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (input.length >= 1 || data.downloadURL) {
      const messageData = {
        text: input,
        sender: user.phoneNumber,
        timestamp: serverTimestamp(),
      };

      // Include the image download URL if it exists in the data state
      if (data.downloadURL) {
        messageData.data = data;
      }

      await addDoc(collection(db, `chats/${id}/messages`), messageData);
      setInput("");
      setData({}); // Clear data after sending the message
    }
  };

  const sendImage = async () => {
    if (data.downloadURL) {
      sendMessage(); // Send the message automatically after the image is uploaded
    }
  };

  return (
    <FormControl p={3} as="form" onSubmit={sendMessage}>
      <div className="h-full flex justify-evently items-center px-1">
        <input
          type="text"
          placeholder="Type a message..."
          className="inputField h-full p-2 dark:bg-gray-900 dark:text-white rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
          autoComplete="off"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <div className="flex flex-row justify-center items-center">
          <div className="formInput w-full sm:w-2/5">
            <label htmlFor="file">
              <AttachFileIcon className="w-5 h-5 dark:text-slate-50" />
            </label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>
          <IconButton
            type="submit"
            className={`${ !input.trim() && !data.downloadURL ? "d-none" : "rounded-sm p-2 dark:text-slate-50 focus:outline-none"}`}
            disabled={!input.trim() && !data.downloadURL}
          >
            <SendIcon />
          </IconButton>
          <SendIcon className={`${ !input.trim() && !data.downloadURL ? "rounded-sm p-2 dark:text-slate-50/50 focus:outline-none" : "d-none"}`} />
        </div>
      </div>
    </FormControl>
  );
}
