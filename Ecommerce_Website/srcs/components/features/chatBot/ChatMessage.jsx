import React from "react";

// Helper function to format price in VND
const formatPrice = (price) => {
  if (typeof price === 'number') {
    return price.toLocaleString('vi-VN') + ' ₫';
  }
  return price;
};

// Helper function to generate product advice based on product details
const generateProductAdvice = (product) => {
  const name = product.name || "";
  const type = product.type || "";
  let advice = "";

  if (name.toLowerCase().includes("laptop")) {
    if (parseInt(product.price) > 25000000) {
      advice = "Đây là laptop cao cấp phù hợp cho công việc đòi hỏi hiệu năng mạnh, đồ họa chuyên nghiệp hoặc gaming ở mức cao.";
    } else if (parseInt(product.price) > 15000000) {
      advice = "Laptop này có cấu hình tốt, cân được hầu hết các nhu cầu làm việc và giải trí thông thường.";
    } else {
      advice = "Đây là laptop có giá tốt, phù hợp cho học tập và các công việc văn phòng cơ bản.";
    }
  } else if (type.toLowerCase().includes("card màn hình") || name.toLowerCase().includes("vga")) {
    if (parseInt(product.price) > 10000000) {
      advice = "Card đồ họa mạnh, phù hợp cho gaming ở độ phân giải cao hoặc làm việc với đồ họa nặng.";
    } else {
      advice = "Card đồ họa phù hợp cho nhu cầu chơi game ở mức trung bình và các ứng dụng đồ họa thông thường.";
    }
  } else if (name.toLowerCase().includes("pc") || type.toLowerCase().includes("pc")) {
    if (parseInt(product.price) > 30000000) {
      advice = "Cấu hình PC cao cấp, đáp ứng mọi nhu cầu từ gaming đến đồ họa chuyên nghiệp.";
    } else if (parseInt(product.price) > 15000000) {
      advice = "PC có hiệu năng mạnh, cân được hầu hết game và phần mềm hiện nay.";
    } else {
      advice = "PC giá tốt, phù hợp cho công việc văn phòng và giải trí thông thường.";
    }
  }

  return advice;
};

export function BotMessage({ text, products }) {
  return (
    <article className="flex gap-3 items-start mt-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
        B
      </div>
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl px-4 py-3 text-base font-sans leading-relaxed shadow-sm max-w-[80%] border border-red-100/50">
        <p className="text-gray-700">{text}</p>
        
        {products && products.length > 0 && (
          <div className="mt-3 space-y-3">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="border border-red-100 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap md:flex-nowrap">
                  {product.image && (
                    <div className="w-full md:w-1/3 mb-2 md:mb-0 md:mr-3">
                      <img 
                        src={product.image} 
                        alt={product.name || "Product"} 
                        className="w-full h-24 object-contain rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                {product.name && (
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h4>
                )}
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                {product.price && (
                        <p className="text-red-600 font-semibold text-base">
                    {formatPrice(product.price)}
                  </p>
                )}
                      
                {product.type && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          {product.type}
                        </span>
                )}
                      
                {product.vendor && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {product.vendor}
                        </span>
                )}
                    </div>
                
                {/* Product advice */}
                    <p className="text-red-700 text-xs mt-2 italic border-l-2 border-red-300 pl-2">
                  {generateProductAdvice(product)}
                </p>
                
                    <div className="mt-3 flex items-center gap-2">
                  {product.link && (
                    <a 
                      href={product.link} 
                      target="_blank"
                      rel="noopener noreferrer"
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all flex items-center"
                    >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                      Xem chi tiết
                    </a>
                  )}
                </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-red-100">
              <p className="font-medium text-red-800 text-sm">Quý khách cần tư vấn thêm?</p>
              <p className="text-xs text-gray-600 mt-1">
                Em có thể giúp anh/chị so sánh các sản phẩm, tư vấn thêm về cấu hình hoặc tìm sản phẩm phù hợp hơn với nhu cầu của anh/chị.
              </p>
            </div>
          </div>
        )}
        
        {products && products.length > 0 && products[0].message && (
          <div className="mt-2 text-red-500">{products[0].message}</div>
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

// Add this to your CSS (tailwind.css) or use a style tag if needed
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`;

// You can add this to your component if needed
function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: animationStyles }} />;
}
