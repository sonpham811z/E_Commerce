const Icon = ({ name, className }) => {
  const icons = {
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    'chevron-down': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    ),
    price: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <span className={`inline-block w-5 h-5 ${className}`}>
      {icons[name] || <span>⚛️</span>}
    </span>
  );
};

export default Icon;