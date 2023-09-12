import Sidebar from "./Sidebar";
import Body from "./Body";
import { motion } from 'framer-motion';
// ... Rest of your imports

function Chat() {
  // ... Rest of your chat-related code

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className='main h-screen flex flex-row justify-between items-center'>
        <section className='w-full lg:w-2/5 h-full bg-transparent'>
          <Sidebar />
        </section>
        <section className='w-3/5 hidden lg:block bg-transparent'>
          <Body />
        </section>
      </div>
    </motion.div>
  );
}

export default Chat;
