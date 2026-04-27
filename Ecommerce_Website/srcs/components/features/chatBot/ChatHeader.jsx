import React from 'react';

export function ChatHeader() {
  return (
    <header className='w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl flex items-center'>
      <div className='w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 shadow-md'>
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
        <h1 className='text-white text-lg font-semibold tracking-wide font-sans'>
          TECHBOT TƯ VẤN
        </h1>
        <p className='text-red-100 text-xs'>
          Hỗ trợ tư vấn sản phẩm công nghệ 24/7
        </p>
      </div>
    </header>
  );
}
