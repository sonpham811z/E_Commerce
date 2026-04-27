function TrianglePointer() {
  return (
    <div className='absolute left-1/2 sm:left-[291px] top-0 transform -translate-x-1/2 sm:transform-none'>
      <svg
        width='81'
        height='50'
        className='w-16 h-10 sm:w-20 sm:h-12 md:w-[81px] md:h-[50px]'
        viewBox='0 0 81 50'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g filter='url(#filter0_d_746_3658)'>
          <path d='M36.5 6L66.3779 36H6.62212L36.5 6Z' fill='white' />
        </g>
        <defs>
          <filter
            id='filter0_d_746_3658'
            x='0.62207'
            y='0'
            width='79.7559'
            height='50'
            filterUnits='userSpaceOnUse'
            colorInterpolationFilters='sRGB'
          >
            <feFlood floodOpacity='0' result='BackgroundImageFix' />
            <feColorMatrix
              in='SourceAlpha'
              type='matrix'
              values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
              result='hardAlpha'
            />
            <feOffset dx='4' dy='4' />
            <feGaussianBlur stdDeviation='5' />
            <feComposite in2='hardAlpha' operator='out' />
            <feColorMatrix
              type='matrix'
              values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
            />
            <feBlend
              mode='normal'
              in2='BackgroundImageFix'
              result='effect1_dropShadow_746_3658'
            />
            <feBlend
              mode='normal'
              in='SourceGraphic'
              in2='effect1_dropShadow_746_3658'
              result='shape'
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default TrianglePointer;
