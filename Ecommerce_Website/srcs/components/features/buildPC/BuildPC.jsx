import { useState } from 'react';
import ConfigViewModal from './ConfigViewModal';
import { FiRefreshCcw, FiEye, FiShare2 } from 'react-icons/fi';
import BuildPartRow from './BuildPartRow';

const COMPONENTS = [
  { key: 'cpu', name: 'CPU', image: '/srcs/assets/buildPC/CPU.png' },
  { key: 'ssd', name: 'Ổ cứng SSD', image: '/srcs/assets/buildPC/SSD.png' },
  {
    key: 'mouse',
    name: 'Chuột máy tính',
    image: '/srcs/assets/buildPC/mouse.png',
  },
  {
    key: 'keyboard',
    name: 'Bàn phím',
    image: '/srcs/assets/buildPC/Keyboard.png',
  },
  {
    key: 'headset',
    name: 'Tai nghe',
    image: '/srcs/assets/buildPC/Headset.png',
  },
  {
    key: 'linh kiện',
    name: 'Tản nhiệt CPU',
    image: '/srcs/assets/buildPC/TN.png',
  },
  { key: 'screen', name: 'Màn hình', image: '/srcs/assets/buildPC/MH.png' },
  {
    key: 'case',
    name: 'Case máy tính',
    image: '/srcs/assets/buildPC/Case.png',
  },
  { key: 'ram', name: 'RAM', image: '/srcs/assets/buildPC/RAM.png' },
];

function BuildPC() {
  const [selectedParts, setSelectedParts] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleReset = () => {
    setSelectedParts({});
  };

  const handleSelect = (key, part) => {
    setSelectedParts((prev) => ({ ...prev, [key]: part }));
  };

  const total = Object.values(selectedParts).reduce(
    (sum, part) => sum + Number(part?.salePrice || 0),
    0
  );

  return (
    <main className='max-w-[1200px] mx-auto px-4 py-8'>
      {/* Header control */}
      <div className='bg-white p-4 rounded shadow mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Build PC</h1>
        <p className='text-sm text-gray-600 mb-4'>
          Chọn các linh kiện máy tính bạn cần để xây dựng cấu hình máy
        </p>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handleReset}
            className='border border-red-300 px-4 py-2 rounded bg-white hover:bg-red-50 text-sm text-red-500'
          >
            <FiRefreshCcw className='inline-block mr-3 transition' />
            Chọn lại từ đầu
          </button>
          <button
            onClick={() => setShowModal(true)}
            className='border border-red-300 px-4 py-2 rounded bg-white hover:bg-red-50 text-sm text-red-500'
          >
            <FiEye className='inline-block mr-3 transition' />
            Xem và in
          </button>
          <button className='border border-red-300 px-4 py-2 rounded bg-white hover:bg-red-50 text-sm text-red-500'>
            <FiShare2 className='inline-block mr-3 transition' />
            Chia sẻ cấu hình
          </button>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        {/* Danh sách linh kiện */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          {COMPONENTS.map((comp) => (
            <BuildPartRow
              key={comp.key}
              partKey={comp.key}
              image={comp.image}
              name={comp.name}
              selected={selectedParts[comp.key]}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Cột tạm tính */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          <div className='bg-white p-4 shadow rounded'>
            <h2 className='font-semibold text-lg mb-2'>Tạm tính:</h2>
            <p className='text-red-600 text-xl font-bold'>
              {total.toLocaleString('vi-VN')} VND
            </p>
            <p className='text-gray-500 text-sm'>
              Giá chưa bao gồm ưu đãi Build PC.
            </p>
          </div>
        </div>
      </div>

      <ConfigViewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedParts={selectedParts}
        total={total}
      />
    </main>
  );
}

export default BuildPC;
