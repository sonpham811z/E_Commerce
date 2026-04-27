function IconSvg({ children, className = '' }) {
  return (
    <div
      className={`icon-container rounded-full text-white p-2 sm:p-3 transition-transform transform hover:scale-110 ${className}`}
    >
      {children}
    </div>
  );
}

export default IconSvg;
