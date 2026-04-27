export default function ChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label='Open Chat Bot'
      className='
        fixed bottom-8 right-14
        w-[55px] h-[55px]
        z-50
        transition-transform duration-200 ease-in-out
        transform hover:scale-110 active:scale-95
        focus:outline-none
      '
    >
      <img
        src='Button_ChatBot.svg'
        alt='Chatbot Icon'
        className='w-full h-full object-contain'
      />
    </button>
  );
}
