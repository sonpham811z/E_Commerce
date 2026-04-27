import { FaLock, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

function PaymentButton({ onClick }) {
  return (
    <section className="pt-4 mb-8">
      <div className="flex flex-col items-center">
        <button
          onClick={onClick}
          className="w-full md:w-[320px] py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Xác nhận thanh toán</span>
          <FaArrowRight />
        </button>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <FaLock className="text-green-600" />
            <span className="text-sm">Thanh toán an toàn</span>
          </div>
          <span className="text-sm">|</span>
          <div className="flex items-center gap-1">
            <FaShieldAlt className="text-green-600" />
            <span className="text-sm">Bảo mật thông tin</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentButton;
