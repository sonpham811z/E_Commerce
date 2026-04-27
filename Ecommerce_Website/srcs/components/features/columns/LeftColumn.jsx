import { Link } from 'react-router-dom';

function LeftColumn() {
  const links = [
    '/san-pham?category=laptop-gaming',
    '/san-pham?category=cpu-intel-i9',
    '/san-pham?category=cpu-amd-r9',
    '/san-pham?category=screen',
  ];
  const images = [
    '/srcs/assets/banner-phu/banner-1.webp',
    '/srcs/assets/banner-phu/banner-2.webp',
    '/srcs/assets/banner-phu/banner-3.webp',
    '/srcs/assets/banner-phu/banner-4.webp',
  ];

  return (
    <div className='flex flex-col sm:flex-row gap-3 sm:gap-5 px-2'>
      {images.map((src, idx) => (
        <Link
          key={idx}
          to={links[idx]}
          className='block flex-1 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300'
          style={{ aspectRatio: '4 / 3' }}
        >
          <img
            src={src}
            alt={`Left image ${idx + 1}`}
            className='w-full h-full object-contain rounded-2xl max-w-full'
            style={{ display: 'block' }}
          />
        </Link>
      ))}
    </div>
  );
}

export default LeftColumn;
