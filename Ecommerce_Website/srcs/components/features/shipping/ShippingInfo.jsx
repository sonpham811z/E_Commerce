function ShippingInfo({ order }) {
  return (
    <section className="border border-black bg-white shadow-md p-6 max-w-[978px] mx-auto">
      <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>

      <div className="flex flex-col gap-5 mb-6">
        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Khách hàng:</span>
          <span>{order.customerName}</span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Số điện thoại:</span>
          <span className="text-[22px]">{order.phone}</span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Địa chỉ nhận hàng:</span>
          <span>{order.fullAddress || order.address}</span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Phí sản phẩm:</span>
          <span className="text-red-600 font-bold">
            {order.productPrice.toLocaleString()}
            <span className="underline">đ</span>
          </span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Phí vận chuyển:</span>
          <span className="font-bold">
            {order.shippingFee.toLocaleString()}
            <span className="underline">đ</span>
          </span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[210px] font-bold">Giảm giá:</span>
          <span className="font-bold">
            -{order.discount.toLocaleString()}
            <span className="underline">đ</span>
          </span>
          <span className="bg-[#ffc0d3] rounded px-3 py-1 text-[#ea1a1a] font-bold text-sm">
            {order.discountCode}
          </span>
        </div>

        <div className="flex gap-5 items-center">
          <span className="w-[130px] font-bold text-[22px]">Tổng tiền:</span>
          <span className="text-red-600 font-bold text-2xl">
            {order.total.toLocaleString()}
            <span className="underline">đ</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default ShippingInfo;
