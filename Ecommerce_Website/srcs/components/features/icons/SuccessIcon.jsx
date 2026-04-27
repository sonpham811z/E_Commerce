import { FaCheck } from 'react-icons/fa';

function SuccessIcon() {
  return (
    <div className="relative w-24 h-24">
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-green-500" style={{animationDuration: '3s'}}></div>
      <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-blue-500" style={{animationDuration: '3.5s'}}></div>
      <div className="absolute inset-2 rounded-full animate-ping opacity-25 bg-red-500" style={{animationDuration: '4s'}}></div>
      
      {/* Rotating gradient border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 animate-spin" style={{animationDuration: '8s'}}></div>
      
      {/* Main white circle */}
      <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center shadow-lg">
        {/* Inner gradient circle */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center transform transition-transform duration-700 hover:scale-110">
          {/* Check icon */}
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <FaCheck className="w-7 h-7 text-green-600 animate-bounce" style={{animationDuration: '2s'}} />
          </div>
        </div>
      </div>
      
      {/* Decorative particles */}
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#4ade80', '#3b82f6', '#ec4899', '#facc15', '#8b5cf6'][i],
            top: `${10 + Math.sin(i) * 20}%`,
            left: `${10 + Math.cos(i) * 80}%`,
            animation: `particle-${i + 1} 4s infinite ease-in-out`,
            opacity: 0.7,
          }}
        />
      ))}
      
      {/* Sparkles */}
      <div className="absolute -top-1 -right-1 w-4 h-4 animate-pulse" style={{animationDuration: '1.5s'}}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M19.778 19.778l-1.414-1.414M19.778 4.222l-1.414 1.414M4.222 19.778l1.414-1.414M4.222 4.222l1.414 1.414" 
            stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 -left-2 w-4 h-4 animate-pulse" style={{animationDuration: '2s'}}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M19.778 19.778l-1.414-1.414M19.778 4.222l-1.414 1.414M4.222 19.778l1.414-1.414M4.222 4.222l1.414 1.414" 
            stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes particle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5px, -10px) scale(1.3); }
        }
        @keyframes particle-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-8px, 5px) scale(1.2); }
        }
        @keyframes particle-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, 8px) scale(1.4); }
        }
        @keyframes particle-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5px, -8px) scale(1.2); }
        }
        @keyframes particle-5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, 10px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}

export default SuccessIcon;
