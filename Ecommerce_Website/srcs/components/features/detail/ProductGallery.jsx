import { useState, useRef } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGallery = ({ image, thumbnails = [] }) => {
  const images = [image, ...thumbnails];
  const [index, setIndex] = useState(0);
  const scrollRef = useRef();

  const prevMain = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextMain = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className='w-full'>
      <div className='border border-gray-200  bg-white  p-1 space-y-4'>
        {/* Ảnh lớn */}
        <div className='relative aspect-video overflow-hidden  bg-gray-50'>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className='w-full h-full absolute'
          >
            <img
              src={images[index]}
              alt={`Ảnh ${index + 1}`}
              className='w-full h-full object-contain'
            />
          </motion.div>

          {/* Nút chuyển ảnh lớn */}
          <button
            onClick={prevMain}
            className='absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow border opacity-50'
          >
            <AiOutlineLeft />
          </button>
          <button
            onClick={nextMain}
            className='absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow border opacity-50'
          >
            <AiOutlineRight />
          </button>
        </div>

        {/* Thumbnail trong cùng khung */}
        <div className='relative'>
          {/* Nút scroll thumbnail */}
          <button
            onClick={prevMain}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10'
          >
            <AiOutlineLeft />
          </button>

          <div ref={scrollRef} className='flex gap-3 overflow-x-auto px-8'>
            {images.map((img, i) => (
              <button
                key={`thumb-${i}-${img || 'noimg'}`}
                onClick={() => setIndex(i)}
                className={`min-w-[70px] h-[70px] overflow-hidden border transition-all duration-200 ${
                  i === index
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`thumb-${i}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>

          <button
            onClick={nextMain}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10'
          >
            <AiOutlineRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGallery;
