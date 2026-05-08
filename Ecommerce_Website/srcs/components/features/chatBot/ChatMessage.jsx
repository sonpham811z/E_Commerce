import React from "react";
import { Link } from "react-router-dom";

const formatPrice = (price) => {
  const num = Number(price);
  if (!price || isNaN(num) || num === 0) return '';
  return num.toLocaleString('vi-VN') + '₫';
};

const getDiscount = (original, sale) => {
  const o = Number(original);
  const s = Number(sale || 0);
  if (!o || isNaN(o) || !s || isNaN(s) || s >= o) return 0;
  return Math.round(((o - s) / o) * 100);
};

const RatingStars = ({ rating }) => {
  if (!rating || isNaN(Number(rating))) return null;
  const r = Number(rating);
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < full ? 'text-yellow-400' : i === full && half ? 'text-yellow-300' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{r.toFixed(1)}</span>
    </span>
  );
};

export function BotMessage({ text, products }) {
  return (
    <article className="flex gap-3 items-start mt-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
        B
      </div>
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl px-4 py-3 text-base font-sans leading-relaxed shadow-sm max-w-[80%] border border-red-100/50">
        <p className="text-gray-700 whitespace-pre-wrap">{text}</p>

        {products && products.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mb-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Sản phẩm gợi ý từ cửa hàng
            </div>

            {products.map((product, index) => {
              const discount = getDiscount(product.original_price, product.sale_price || product.price);
              const displayPrice = formatPrice(product.sale_price || product.price);
              const origPrice = formatPrice(product.original_price);

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all overflow-hidden"
                >
                  <div className="flex gap-3 p-2.5">
                    {product.image && (
                      <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name || "Product"}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20fill%3D%22%239ca3af%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                        {discount > 0 && (
                          <span className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {product.brand && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                            {product.brand}
                          </span>
                        )}
                        {product.category && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        {displayPrice && (
                          <span className="text-sm font-bold text-red-600">{displayPrice}</span>
                        )}
                        {origPrice && discount > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">{origPrice}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={product.rating} />
                      </div>
                    </div>
                  </div>

                  {product.link && (
                    <Link
                      to={product.link}
                      className="block w-full text-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium py-1.5 transition-all"
                    >
                      Xem chi tiết →
                    </Link>
                  )}
                </div>
              );
            })}

            <div className="mt-2 pt-2 border-t border-red-100">
              <p className="text-xs text-gray-500">
                Em có thể giúp anh/chị so sánh hoặc tìm sản phẩm phù hợp hơn.
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function UserMessage({ text }) {
  return (
    <article className="flex justify-end mt-6 animate-fadeIn">
      <div className="flex items-end gap-3 max-w-[75%]">
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 rounded-2xl text-base font-sans leading-relaxed shadow-md">
          {text}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
          U
        </div>
      </div>
    </article>
  );
}
