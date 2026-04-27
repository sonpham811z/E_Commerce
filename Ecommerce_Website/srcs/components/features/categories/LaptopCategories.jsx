import { useState, useEffect, useRef } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';

const LaptopCategories = ({ onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const containerRef = useRef();
  const navigate = useNavigate();

  const categories = {
    Laptop: {
      items: [
        'Laptop Gaming',
        'Laptop Văn phòng',
        'Laptop Đồ họa',
        'Ultrabook',
        'Laptop Doanh nhân',
        'Tất cả sản phẩm',
      ],
    },
    'Laptop Gaming': {
      items: [
        'PC GVN',
        'Main, CPU, VGA',
        'Case, Nguồn, Tản',
        'Ổ cứng, RAM, Thẻ nhớ',
        'Loa, Micro, Webcam',
        'Màn hình',
        'Bàn phím',
        'Chuột + Lót chuột',
        'Tai Nghe',
        'Ghế - Bàn',
        'Phần mềm, mạng',
        'Handheld, Console',
        'Phụ kiện (Hub, sạc, cặp...)',
        'Dịch vụ và thông tin khác',
      ],
    },
    'Thương hiệu': {
      subcategories: {
        ASUS: [
          'ASUS ROG Zephyrus',
          'ASUS ROG Strix',
          'ASUS TUF Gaming',
          'ASUS OLED Series',
          'Vivobook Series',
          'Zenbook Series',
        ],
        ACER: [
          'Acer Nitro 5',
          'Acer Predator Helios',
          'Aspire Series',
          'Swift Series',
        ],
        MSI: [
          'MSI Katana Series',
          'MSI Cyborg Series',
          'Modern Series',
          'Prestige Series',
          'MSI Raider Series',
        ],
        LENOVO: [
          'Legion Series',
          'Thinkbook Series',
          'Ideapad Series',
          'Thinkpad Series',
          'Yoga Series',
        ],
        DELL: [
          'Alienware Series',
          'G15 Series',
          'Inspiron Series',
          'Vostro Series',
          'Latitude Series',
          'XPS Series',
        ],
        'HP - Pavilion': [
          'HP Victus',
          'HP Omen',
          'HP Pavilion Gaming',
          'HP Spectre',
        ],
        'LG - Gram': ['LG Gram 14', 'LG Gram 16', 'LG Gram 17'],
      },
    },
    'Laptop AI': {
      items: [
        'Dưới 15 triệu',
        'Từ 15 đến 20 triệu',
        'Trên 20 triệu',
        'Tích hợp AI Copilot',
        'Chạy tốt mô hình AI',
        'Laptop cho AI Engineer',
      ],
    },
    'CPU Intel - AMD': {
      items: [
        'Intel Core i3',
        'Intel Core i5',
        'Intel Core i7',
        'Intel Core i9',
        'AMD Ryzen 3',
        'AMD Ryzen 5',
        'AMD Ryzen 7',
        'AMD Ryzen 9',
      ],
    },
    'Nhu cầu sử dụng': {
      items: [
        'Đồ họa - Studio',
        'Học sinh - Sinh viên',
        'Mỏng nhẹ cao cấp',
        'Lập trình viên',
        'Văn phòng - Hành chính',
        'Gaming chuyên nghiệp',
      ],
    },
    'Linh phụ kiện Laptop': {
      items: [
        'Ram laptop',
        'SSD laptop',
        'Ổ cứng di động',
        'Đế tản nhiệt',
        'Túi chống sốc',
        'Dock sạc',
        'Hub mở rộng',
      ],
    },
  };

  const handleClickCategory = (category) => {
    if (category === 'Bàn phím') {
      navigate('/san-pham?category=keyboard');
    } else if (category === 'SSD laptop') {
      navigate('/san-pham?category=ssd');
    } else if (category === 'Tai Nghe') {
      navigate('/san-pham?category=headphone');
    } else if (category === 'Đế tản nhiệt') {
      navigate('/san-pham?category=pccooling');
    } else if (category === 'Chuột + Lót chuột') {
      navigate('/san-pham?category=mouse');
    } else if (category === 'PC GVN') {
      navigate('/san-pham?category=pcgaming');
    } else if (category === 'Laptop') {
      navigate('/san-pham?category=laptop');
    } else if (category === 'Laptop Đồ họa') {
      navigate('/san-pham?category=laptop-do-hoa');
    } else if (category === 'Laptop Doanh nhân') {
      navigate('/san-pham?category=laptop-doanh-nhan');
    } else if (category === 'Laptop Gaming') {
      navigate('/san-pham?category=laptop-gaming');
    } else if (category === 'Laptop Văn phòng') {
      navigate('/san-pham?category=laptop-van-phong');
    } else if (category === 'ASUS OLED Series') {
      navigate('/san-pham?category=laptop-asus-oled');
    } else if (category === 'Vivobook Series') {
      navigate('/san-pham?category=laptop-asus-vivobook');
    } else if (category === 'Zenbook Series') {
      navigate('/san-pham?category=laptop-asus-zenbook');
    } else if (category === 'ASUS TUF Gaming') {
      navigate('/san-pham?category=laptop-asus-tuf');
    } else if (category === 'ASUS ROG Strix') {
      navigate('/san-pham?category=laptop-rog-strix');
    } else if (category === 'ASUS ROG Zephyrus') {
      navigate('/san-pham?category=laptop-rog-zephyrus');
    } else if (category === 'Aspire Series') {
      navigate('/san-pham?category=laptop-acer-aspire');
    } else if (category === 'Swift Series') {
      navigate('/san-pham?category=laptop-acer-swift');
    } else if (category === 'Acer Predator Helios') {
      navigate('/san-pham?category=laptop-acer-predator-helios');
    } else if (category === 'Acer Nitro 5') {
      navigate('/san-pham?category=laptop-acer-nitro');
    } else if (category === 'MSI Cyborg Series') {
      navigate('/san-pham?category=laptop-msi-cyborg');
    } else if (category === 'MSI Katana Series') {
      navigate('/san-pham?category=laptop-msi-katana');
    } else if (category === 'Modern Series') {
      navigate('/san-pham?category=laptop-msi-modern');
    } else if (category === 'Prestige Series') {
      navigate('/san-pham?category=laptop-msi-prestige');
    } else if (category === 'MSI Raider Series') {
      navigate('/san-pham?category=laptop-msi-raider');
    } else if (category === 'Ideapad Series') {
      navigate('/san-pham?category=laptop-lenovo-ideapad');
    } else if (category === 'Legion Series') {
      navigate('/san-pham?category=laptop-lenovo-legion');
    } else if (category === 'Thinkbook Series') {
      navigate('/san-pham?category=laptop-lenovo-thinkbook');
    } else if (category === 'Thinkpad Series') {
      navigate('/san-pham?category=laptop-lenovo-thinkpad');
    } else if (category === 'Yoga Series') {
      navigate('/san-pham?category=laptop-lenovo-yoga');
    } else if (category === 'Alienware Series') {
      navigate('/san-pham?category=laptop-dell-alienware');
    } else if (category === 'G15 Series') {
      navigate('/san-pham?category=laptop-dell-g15');
    } else if (category === 'Inspiron Series') {
      navigate('/san-pham?category=laptop-dell-inspiron');
    } else if (category === 'XPS Series') {
      navigate('/san-pham?category=laptop-dell-xps');
    } else if (category === 'Latitude Series') {
      navigate('/san-pham?category=laptop-dell-latitude');
    } else if (category === 'Vostro Series') {
      navigate('/san-pham?category=laptop-dell-vostro');
    } else if (category === 'HP Victus') {
      navigate('/san-pham?category=laptop-hp-victus');
    } else if (category === 'HP Omen') {
      navigate('/san-pham?category=laptop-hp-omen');
    } else if (category === 'Dưới 15 triệu') {
      navigate('/san-pham?category=laptop-duoi-15-trieu');
    } else if (category === 'Từ 15 đến 20 triệu') {
      navigate('/san-pham?category=laptop-tu-15-den-20-trieu');
    } else if (category === 'Trên 20 triệu') {
      navigate('/san-pham?category=laptop-tren-20-trieu');
    } else if (category === 'Chạy tốt mô hình AI') {
      navigate('/san-pham?category=laptop-chay-ai');
    } else if (category === 'Intel Core i3') {
      navigate('/san-pham?category=cpu-intel-i3');
    } else if (category === 'Intel Core i5') {
      navigate('/san-pham?category=cpu-intel-i5');
    } else if (category === 'Intel Core i7') {
      navigate('/san-pham?category=cpu-intel-i7');
    } else if (category === 'Intel Core i9') {
      navigate('/san-pham?category=cpu-intel-i9');
    } else if (category === 'AMD Ryzen 3') {
      navigate('/san-pham?category=cpu-amd-r3');
    } else if (category === 'AMD Ryzen 5') {
      navigate('/san-pham?category=cpu-amd-r5');
    } else if (category === 'AMD Ryzen 7') {
      navigate('/san-pham?category=cpu-amd-r7');
    } else if (category === 'AMD Ryzen 9') {
      navigate('/san-pham?category=cpu-amd-r9');
    } else if (category === 'Tất cả sản phẩm') {
      navigate('/san-pham');
    } else {
      const el = document.getElementById(category);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    onClose?.();
  };

  const toggleCategory = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setExpandedCategory(null);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className='absolute top-full left-0 mt-1 bg-white shadow-lg rounded-xl p-6 w-[1100px] max-h-[500px] overflow-auto z-50 text-gray-900 text-lg flex'
    >
      {/* Sidebar Categories */}
      <ul className='w-1/3 space-y-3 border-r border-gray-300 pr-6'>
        {Object.entries(categories).map(([category, data]) => {
          const hasSub = !!data.subcategories;
          const hasItems = data.items?.length > 0;
          const isExpandable = hasSub || hasItems;
          const isExpanded = expandedCategory === category;

          return (
            <li key={category}>
              <button
                onClick={() =>
                  isExpandable
                    ? toggleCategory(category)
                    : handleClickCategory(category)
                }
                className='w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-200 hover:scale-105 font-semibold'
              >
                <span>{category}</span>
                {isExpandable &&
                  (isExpanded ? (
                    <ChevronDownIcon className='w-4 h-4 text-gray-600' />
                  ) : (
                    <ChevronRightIcon className='w-4 h-4 text-gray-600' />
                  ))}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Right Panel */}
      <div className='w-2/3 pl-6 overflow-auto max-h-[440px]'>
        {expandedCategory && (
          <>
            {/* Subcategories (multi-column) */}
            {categories[expandedCategory].subcategories && (
              <div className='grid grid-cols-4 gap-8'>
                {Object.entries(categories[expandedCategory].subcategories).map(
                  ([subCategory, items]) => (
                    <div key={subCategory}>
                      <h4 className='font-semibold mb-3'>{subCategory}</h4>
                      <ul className='space-y-2'>
                        {items.length > 0 ? (
                          items.map((item) => (
                            <li key={item}>
                              <button
                                onClick={() => handleClickCategory(item)}
                                className='w-full text-left text-base hover:text-red-600 transition duration-200 hover:scale-105'
                              >
                                {item}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className='italic text-gray-400 text-sm'>
                            Chưa có mục nào
                          </li>
                        )}
                      </ul>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Flat list of items */}
            {!categories[expandedCategory].subcategories &&
              categories[expandedCategory].items && (
                <ul className='space-y-2'>
                  {categories[expandedCategory].items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => handleClickCategory(item)}
                        className='w-full text-left text-base hover:text-red-600 transition duration-200 hover:scale-105'
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default LaptopCategories;
