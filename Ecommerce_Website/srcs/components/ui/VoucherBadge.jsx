import { FaTicketAlt, FaPercentage } from 'react-icons/fa';

function VoucherBadge({ code = "GIAMGIA500", color = "#E1F5FE" }) {
  // Generate a nice gradient based on input color
  const getGradient = () => {
    return `linear-gradient(135deg, ${color} 0%, #ffffff 50%, ${color} 100%)`;
  };

  return (
    <div 
      className="relative inline-flex items-center rounded-lg overflow-hidden border border-dashed shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
      style={{ 
        borderColor: '#0288D1', 
        background: getGradient(),
        filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))'
      }}
    >
      {/* Left part with circles design */}
      <div className="relative flex items-center justify-center h-8 w-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <FaPercentage size={12} className="absolute animate-ping opacity-70" />
        <FaTicketAlt size={12} />
        
        {/* Decorative circles */}
        <div className="absolute -right-1.5 top-0 w-3 h-3 rounded-full bg-white"></div>
        <div className="absolute -right-1.5 bottom-0 w-3 h-3 rounded-full bg-white"></div>
      </div>
      
      {/* Code text */}
      <div className="px-3 py-1 text-xs font-bold text-blue-800 flex items-center">
        <span className="mr-1 group">
          {code}
          <span className="block w-0 group-hover:w-full h-0.5 bg-blue-400 transition-all duration-300"></span>
        </span>
      </div>
      
      {/* Shining effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          animation: 'shine 2s infinite'
        }}
      ></div>
      
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          60%, 100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default VoucherBadge;
