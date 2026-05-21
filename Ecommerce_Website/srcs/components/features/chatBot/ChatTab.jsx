import React, { useState, useRef, useEffect } from 'react';
import { BotMessage, UserMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Kết nối qua Node.js ai-service (port 3002) - proxy đến Python FastAPI
// Dùng biến môi trường Vite — ĐÚNG
const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3002';
const FALLBACK_API_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:3002';

// Create a function to check if ChatBot service is running
const testChatbotConnection = async (url) => {
  try {
    await axios.get(`${url}/health`);
    console.log('Connection successful to:', url);
    return true;
  } catch (error) {
    console.error(`Connection failed to: ${url}`, error);
    return false;
  }
};

export default function ChatTab({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      from: 'bot',
      text: 'Xin kính chào quý khách, TechBot xin hân hạnh phục vụ và giải đáp các thắc mắc của quý khách.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeApiUrl, setActiveApiUrl] = useState(API_BASE_URL);

  useEffect(() => {
    console.log('ChatTab mounted, testing API connection...');
    checkApiConnection();

    const intervalId = setInterval(() => {
      if (apiStatus === 'error' && retryCount < 5) {
        console.log(`Retrying API connection (${retryCount + 1}/5)...`);
        checkApiConnection();
        setRetryCount((prev) => prev + 1);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [apiStatus, retryCount]);

  useEffect(() => {
    scrollToBottom();
    console.log('Messages updated:', messages);
  }, [messages]);

  const checkApiConnection = async () => {
    // Thử kết nối đến URL mặc định trước
    const mainConnected = await testChatbotConnection(API_BASE_URL);

    if (mainConnected) {
      console.log('Using primary API URL:', API_BASE_URL);
      setActiveApiUrl(API_BASE_URL);
      setApiStatus('connected');
      setRetryCount(0);
      return;
    }

    // Nếu URL mặc định không hoạt động, thử URL fallback
    const fallbackConnected = await testChatbotConnection(FALLBACK_API_URL);

    if (fallbackConnected) {
      console.log('Using fallback API URL:', FALLBACK_API_URL);
      setActiveApiUrl(FALLBACK_API_URL);
      setApiStatus('connected');
      setRetryCount(0);
      return;
    }

    // Nếu cả hai đều không hoạt động
    console.error('All API connections failed');
    setApiStatus('error');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMsg = { id: uuidv4(), from: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    console.log(`Sending query to chatbot API at ${activeApiUrl}`);

    try {
      const requestData = { message: inputValue.trim() };

      console.log('Sending request:', requestData);

      const response = await axios({
        method: 'post',
        url: `${activeApiUrl}/api/chat`,
        data: requestData,
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
      });

      const data = response.data;
      console.log('API response:', data);

      // Map deep_link → link for BotMessage's <Link to={product.link}>
      const products = data.products?.length
        ? data.products.map((p) => ({ ...p, link: p.deep_link }))
        : null;

      const botMsg = {
        id: uuidv4(),
        from: 'bot',
        text: data.answer || 'Xin lỗi, em không thể trả lời câu hỏi này.',
        products,
      };

      console.log('Adding bot message:', botMsg);
      setMessages((prev) => [...prev, botMsg]);

      setApiStatus('connected');
    } catch (error) {
      console.error('API Error:', error);

      let errorMessage = 'Không thể kết nối đến máy chủ';
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = `Lỗi từ máy chủ: ${error.response.status} - ${
          error.response.data?.detail || 'Unknown error'
        }`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage =
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo máy chủ đang chạy.';
        setApiStatus('error');

        // Thử kết nối lại
        checkApiConnection();
      } else {
        // Something happened in setting up the request
        errorMessage = `Lỗi: ${error.message}`;
      }

      const errorMsg = {
        id: uuidv4(),
        from: 'bot',
        text: errorMessage,
      };
      console.log('Adding error message:', errorMsg); // Added debug
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetryConnection = () => {
    setApiStatus('checking');
    checkApiConnection();
  };

  return (
    <section
      className='fixed bottom-[20px] right-5 w-[350px] h-[550px] flex flex-col bg-white rounded-2xl shadow-xl z-50 border border-red-100 overflow-hidden'
      style={{
        boxShadow:
          '0 10px 25px -5px rgba(220, 38, 38, 0.1), 0 8px 10px -6px rgba(220, 38, 38, 0.1)',
      }}
    >
      <div className='relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white'>
        <div className='flex items-center'>
          <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-md'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
              />
            </svg>
          </div>
          <div>
            <h3 className='font-bold text-lg'>TECHBOT TƯ VẤN</h3>
            <p className='text-red-100 text-xs'>
              Hỗ trợ trả lời mọi thắc mắc về sản phẩm
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label='Close Chat'
          className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition focus:outline-none'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>


      {apiStatus === 'checking' && (
        <div className='bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-2 mx-4 rounded mt-2 text-sm animate-pulse'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <p>Đang thiết lập kết nối đến máy chủ...</p>
          </div>
        </div>
      )}

      {apiStatus === 'error' && (
        <div className='bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-2 mx-4 rounded mt-2 text-sm'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <p>Không thể kết nối đến máy chủ</p>
          </div>
          <button
            onClick={handleRetryConnection}
            className='mt-1 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs flex items-center transition-colors'
          >
            <svg
              className='w-3 h-3 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              ></path>
            </svg>
            Thử lại kết nối
          </button>
        </div>
      )}

      <main
        className='flex-1 overflow-y-auto space-y-3 py-4 px-3 mx-2 my-3 bg-gray-50 rounded-xl border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.length > 0 ? (
          messages.map((msg) =>
            msg.from === 'bot' ? (
              <BotMessage
                key={msg.id}
                text={msg.text}
                products={msg.products}
              />
            ) : (
              <UserMessage key={msg.id} text={msg.text} />
            )
          )
        ) : (
          <div className='text-center text-gray-500 py-4'>
            Không có tin nhắn
          </div>
        )}
        {loading && (
          <div className='flex gap-3 items-start mt-4 animate-pulse'>
            <div className='w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white font-bold text-sm'>
              B
            </div>
            <div className='bg-red-100 rounded-2xl px-4 py-3 text-base max-w-[75%]'>
              <div className='flex space-x-2'>
                <div className='h-2 w-2 bg-red-400 rounded-full animate-bounce'></div>
                <div
                  className='h-2 w-2 bg-red-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className='h-2 w-2 bg-red-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <p className='mt-1 text-red-500 text-sm'>
                Đang tìm kiếm sản phẩm phù hợp...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={sendMessage}
        onKeyPress={handleKeyPress}
        loading={loading}
        disabled={apiStatus === 'error'}
      />
    </section>
  );
}
