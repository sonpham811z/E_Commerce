import { FaCreditCard, FaMoneyBillWave, FaWallet, FaQrcode, FaDownload, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { useState, useEffect, useCallback, useRef } from 'react';

// Bank / wallet constants
const BANK_CONFIG = {
  bankId: '970418',       // BIDV VietQR code
  accountNo: '6722654623',
  accountName: 'PHAM THAI SON',
};
const MOMO_PHONE = '0327299509';
const MOMO_NAME  = 'PHAM THAI SON';

/** Build VietQR image URL (no API key needed) */
const buildBankQrUrl = (amount, note) =>
  `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png` +
  `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

/** Build MoMo QR via qrserver.com */
const buildMomoQrUrl = (amount, note) => {
  const momoData = `2|99|${MOMO_PHONE}|${MOMO_NAME}||0|0|${amount}|${note}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoData)}`;
};

const generateRefId = () => `ThanhToan_ORD${Date.now().toString().slice(-6)}`;

function PaymentMethods({ paymentMethod, setPaymentMethod, orderInfo }) {
  const [qrState, setQrState] = useState({ imageUrl: null, note: '', amount: 0 });
  const [loading, setLoading]   = useState(false);
  const [imgError, setImgError] = useState(false);
  const refIdRef = useRef(generateRefId());

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    const num = typeof price === 'string'
      ? parseInt(price.replace(/[^\d]/g, ''), 10)
      : parseInt(price, 10);
    return isNaN(num) ? '0 ₫' : num.toLocaleString('vi-VN') + ' ₫';
  };

  const getOrderAmount = useCallback(() => {
    if (!orderInfo?.product) return 100000;
    try {
      const salePrice = typeof orderInfo.product.salePrice === 'string'
        ? parseInt(orderInfo.product.salePrice.replace(/[^\d]/g, ''), 10)
        : (orderInfo.product.salePrice || 0);
      let amount = salePrice * (orderInfo.product.quantity || 1);
      if (orderInfo.discount?.amount) amount -= orderInfo.discount.amount;
      return Math.max(amount, 0);
    } catch {
      return 100000;
    }
  }, [orderInfo]);

  // Build QR when payment method changes
  useEffect(() => {
    if (paymentMethod !== 'bank' && paymentMethod !== 'wallet') {
      setQrState({ imageUrl: null, note: '', amount: 0 });
      return;
    }

    setLoading(true);
    setImgError(false);

    const amount = getOrderAmount();
    const note   = refIdRef.current;

    const imageUrl = paymentMethod === 'bank'
      ? buildBankQrUrl(amount, note)
      : buildMomoQrUrl(amount, note);

    setQrState({ imageUrl, note, amount });
    setLoading(false);
  }, [paymentMethod, getOrderAmount]);

  const methods = [
    {
      id: 'cod',
      label: 'Thanh toán khi nhận hàng',
      icon: <FaMoneyBillWave className="text-2xl text-green-600" />,
      description: 'Thanh toán bằng tiền mặt khi nhận hàng tại địa chỉ của bạn.',
    },
    {
      id: 'bank',
      label: 'Thanh toán qua ngân hàng',
      icon: <FaCreditCard className="text-2xl text-blue-600" />,
      description: 'Chuyển khoản qua tài khoản ngân hàng BIDV của chúng tôi.',
    },
    {
      id: 'wallet',
      label: 'Thanh toán qua ví điện tử',
      icon: <FaWallet className="text-2xl text-purple-600" />,
      description: 'Thanh toán qua ví điện tử Momo nhanh chóng, tiện lợi.',
    },
  ];

  const getPaymentName = () =>
    paymentMethod === 'bank' ? 'BIDV' : paymentMethod === 'wallet' ? 'MoMo' : '';

  const handleDownload = async () => {
    try {
      const res = await fetch(qrState.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-qr-${qrState.note}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrState.imageUrl, '_blank');
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Phương thức thanh toán</h2>

      <div className="flex flex-col gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setPaymentMethod(method.id)}
          >
            <input
              type="radio"
              id={method.id}
              name="payment-method"
              checked={paymentMethod === method.id}
              onChange={() => setPaymentMethod(method.id)}
              className="hidden"
            />
            <label htmlFor={method.id} className="flex items-center gap-4 cursor-pointer w-full">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                {method.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg text-gray-800">{method.label}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}
              >
                {paymentMethod === method.id && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* QR Code Section */}
      {(paymentMethod === 'bank' || paymentMethod === 'wallet') && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <FaQrcode className="text-blue-600" />
            Mã QR thanh toán {getPaymentName()}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
              <p className="text-sm text-gray-500">Đang tạo mã QR...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* QR Image */}
              <div className="flex-1">
                <div className="bg-gray-50 p-4 rounded-xl flex justify-center">
                  {imgError ? (
                    <div className="flex flex-col items-center justify-center h-[250px] w-[250px] bg-gray-100 rounded-lg gap-2">
                      <FaExclamationCircle className="text-red-400 text-3xl" />
                      <p className="text-sm text-center text-gray-500 px-4">
                        Không tải được mã QR. Vui lòng dùng thông tin chuyển khoản bên cạnh.
                      </p>
                    </div>
                  ) : (
                    <img
                      src={qrState.imageUrl}
                      alt="QR thanh toán"
                      className="max-w-[250px] rounded-lg"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
              </div>

              {/* Payment details */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Số tiền:</span>
                  <span className="text-blue-600 font-bold">{formatPrice(qrState.amount)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Nội dung CK:</span>
                  <span className="font-mono text-gray-700">{qrState.note}</span>
                </div>

                <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                  Quét mã QR bằng ứng dụng ngân hàng / MoMo để thanh toán tự động.
                </p>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  disabled={imgError}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <FaDownload /> Tải mã QR
                </button>

                {/* Manual transfer info */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <h5 className="font-medium text-gray-700 mb-2">Thông tin chuyển khoản:</h5>
                  {paymentMethod === 'bank' && (
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Ngân hàng:</span> BIDV</p>
                      <p><span className="font-medium">Số tài khoản:</span> {BANK_CONFIG.accountNo}</p>
                      <p><span className="font-medium">Chủ TK:</span> {BANK_CONFIG.accountName}</p>
                      <p><span className="font-medium">Số tiền:</span> {formatPrice(qrState.amount)}</p>
                      <p><span className="font-medium">Nội dung:</span> {qrState.note}</p>
                    </div>
                  )}
                  {paymentMethod === 'wallet' && (
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Ví MoMo:</span> {MOMO_PHONE}</p>
                      <p><span className="font-medium">Tên:</span> {MOMO_NAME}</p>
                      <p><span className="font-medium">Số tiền:</span> {formatPrice(qrState.amount)}</p>
                      <p><span className="font-medium">Nội dung:</span> {qrState.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default PaymentMethods;
