import React from "react";

export function ChatInput({
  inputValue,
  setInputValue,
  onSend,
  onKeyPress,
  loading,
  disabled,
}) {
  return (
    <div className="px-3 py-3 border-t border-gray-200 bg-white rounded-b-2xl">
      <div className="relative flex items-center">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyPress}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={disabled || loading}
          className={`
            w-full pr-12 py-3 px-4 border border-gray-200 rounded-xl resize-none 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            shadow-sm transition-all bg-gray-50 placeholder-gray-400
            ${disabled ? 'bg-gray-100 text-gray-500' : 'text-gray-800'}
            ${loading ? 'opacity-70' : 'opacity-100'}
          `}
          style={{ minHeight: "60px", maxHeight: "120px" }}
          rows={2}
      />
      <button
        onClick={onSend}
          disabled={disabled || loading || !inputValue.trim()}
          className={`
            absolute right-2 p-2 rounded-full 
            transition-all duration-200 ease-in-out flex items-center justify-center
            ${
              !inputValue.trim() || disabled || loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105"
            }
          `}
          aria-label="Send message"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transform rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
      </button>
      </div>

      {disabled && (
        <p className="text-xs text-red-500 mt-1 px-1">
          Không thể gửi tin nhắn khi không có kết nối đến máy chủ
        </p>
      )}
      
      {!disabled && (
        <div className="flex justify-between mt-2 px-1">
          <p className="text-xs text-gray-500">
            Ví dụ: "Tư vấn laptop gaming dưới 20 triệu"
          </p>
          <p className="text-xs text-gray-400">
            {inputValue.length > 0 ? `${inputValue.length} ký tự` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
