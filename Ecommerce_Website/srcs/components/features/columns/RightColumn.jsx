import { Link } from 'react-router-dom';
import Banner5 from '@/assets/banner-phu/banner-5.webp';
import Banner6 from '@/assets/banner-phu/banner-6.webp';
import Banner7 from '@/assets/banner-phu/banner-7.webp';

function RightColumn() {
  const links = [
    '/san-pham?category=case',
    '/san-pham?category=keyboard',
    '/san-pham?category=mouse',
  ];
  const images = [Banner5, Banner6, Banner7];

  return (
    <div className='flex flex-col gap-3 sm:gap-4 md:gap-5 px-2 pt-2 h-full'>
      {images.map((src, idx) => (
        <Link
          key={idx}
          to={links[idx]}
          className='block rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300'
          style={{ flex: 1, minHeight: 0 }}
        >
          <img
            src={src}
            alt={`Right image ${idx + 1}`}
            className='w-full h-full object-contain rounded-2xl max-w-full'
            style={{ display: 'block' }}
          />
        </Link>
      ))}
    </div>
  );
}

export default RightColumn;
