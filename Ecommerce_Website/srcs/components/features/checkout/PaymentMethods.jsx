function PaymentMethods({ selectedMethod, setSelectedMethod }) {
  const methods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Bạn chỉ thanh toán khi nhận được hàng",
    },
    {
      id: "card",
      name: "Thanh toán bằng thẻ ngân hàng",
      description: "Thanh toán qua thẻ ATM/Visa/Mastercard",
    },
    {
      id: "momo",
      name: "Ví MoMo",
      description: "Thanh toán qua ví MoMo nhanh chóng",
    },
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua tài khoản ngân hàng",
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Phương thức thanh toán</h3>
      <div className="space-y-4">
        {methods.map((method) => (
          <label
            key={method.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="hidden"
            />
            <div
              className={`w-4 h-4 rounded-full border border-black flex items-center justify-center ${
                selectedMethod === method.id ? "bg-black" : "bg-white"
              }`}
            >
              {selectedMethod === method.id && (
                <div className="w-3 h-3 rounded-full bg-white"></div>
              )}
            </div>
            <div>
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default PaymentMethods;
