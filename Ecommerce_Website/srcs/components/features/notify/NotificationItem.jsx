function NotificationItem({
  title,
  description,
  icon,
  color,
  time,
  isNew,
  className = '',
}) {
  return (
    <div
      className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${className}`}
    >
      <div className='flex items-start gap-2 sm:gap-3'>
        <div className={`${color} mt-1 text-lg sm:text-xl`}>{icon}</div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h3 className='font-medium text-gray-800 text-sm sm:text-base leading-tight'>
              {title}
            </h3>
            {isNew && (
              <span className='bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0'>
                Mới
              </span>
            )}
          </div>
          <p className='text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed break-words'>
            {description}
          </p>
          {time && <p className='text-xs text-gray-500 mt-1'>{time}</p>}
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;
