import { useState } from 'react';
import ChatButton from '@/components/features/chatBot/ChatButton';
import ChatTab from '@/components/features/chatBot/ChatTab';

export default function ChatBotContainer() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const closeChat = () => setIsOpen(false);

  return (
    // Ẩn chatbot trên mobile (< 1024px) để tối ưu trải nghiệm
    <div className='hidden lg:block'>
      {!isOpen ? (
        <ChatButton onClick={toggleChat} />
      ) : (
        <div className='fixed bottom-[80px] right-4 lg:right-10 z-50'>
          <ChatTab onClose={closeChat} />
        </div>
      )}
    </div>
  );
}
