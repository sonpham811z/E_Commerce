import { useState } from 'react';

const jobData = {
  departments: [
    { name: 'Tất cả', count: 1 },
    { name: 'Hành Chính', count: 0 },
    { name: 'Product Marketing', count: 0 },
    { name: 'Tài chính kế toán', count: 0 },
    { name: 'Phát triển phần mềm', count: 0 },
    { name: 'Phòng kỹ thuật bảo hành', count: 0 },
    { name: 'Kinh doanh Online', count: 1 },
    { name: 'Showroom Hoàng Hoa Thám', count: 0 },
  ],
  locations: [
    'Tất cả',
    'HÀ NỘI - THÁI HÀ',
    'HỒ CHÍ MINH - HOÀNG HOA THÁM',
    'HỒ CHÍ MINH - KHA VẠN CÂN',
    'HỒ CHÍ MINH - TRẦN HƯNG ĐẠO',
    'HỒ CHÍ MINH - HOÀNG VĂN THỤ',
    'HỦ CHÍ MINH - AN DƯƠNG VƯƠNG',
  ],
  jobs: [
    {
      title: 'Cộng tác viên Livestream',
      type: 'Bán thời gian',
      location:
        'HỒ CHÍ MINH - HOÀNG HOA THÁM, 78-80-82 Hoàng Hoa Thám, Phường 12, Quận Tân Bình, HCM',
      salary: 'Thương lượng',
      date: '07/05 — 06/06/2025',
    },
  ],
};

export default function JobPage() {
  const [searchDept, setSearchDept] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Lọc phòng ban theo từ khóa search
  const filteredDepartments = jobData.departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchDept.toLowerCase())
  );

  // Lọc địa điểm theo từ khóa search
  const filteredLocations = jobData.locations.filter((loc) =>
    loc.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10'>
      {/* Mobile Filter Toggle */}
      <div className='lg:hidden mb-4'>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2'
        >
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z'
            />
          </svg>
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
      </div>

      <div className='flex flex-col lg:flex-row gap-6 lg:gap-10'>
        {/* Bên trái - Lọc */}
        <div
          className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block flex flex-col w-full lg:w-72 gap-6 lg:gap-8`}
        >
          {/* Phòng ban */}
          <div>
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 uppercase text-gray-800'>
              Phòng Ban
            </h3>
            <input
              type='search'
              placeholder='Tìm nhanh phòng ban...'
              className='w-full mb-2 sm:mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base'
              value={searchDept}
              onChange={(e) => setSearchDept(e.target.value)}
            />
            <div className='flex flex-col gap-1 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              {filteredDepartments.map((dept, i) => (
                <label
                  key={i}
                  className='inline-flex items-center gap-2 text-gray-700 cursor-pointer text-sm sm:text-base'
                >
                  <input
                    type='checkbox'
                    className='form-checkbox text-red-600 w-4 h-4'
                  />
                  <span>
                    {dept.name}{' '}
                    <span className='text-red-500'>({dept.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 uppercase text-gray-800'>
              Địa Điểm
            </h3>
            <input
              type='search'
              placeholder='Tìm nhanh địa điểm...'
              className='w-full mb-2 sm:mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base'
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            <div className='flex flex-col gap-1 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              {filteredLocations.map((loc, i) => (
                <label
                  key={i}
                  className='inline-flex items-center gap-2 text-gray-700 cursor-pointer text-sm sm:text-base'
                >
                  <input
                    type='checkbox'
                    className='form-checkbox text-red-600 w-4 h-4'
                  />
                  <span className='break-words'>{loc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bên phải - Danh sách việc làm */}
        <div className='flex-1 min-w-0'>
          <h2 className='text-lg sm:text-xl font-bold text-red-600 mb-4 sm:mb-6'>
            CÁC CƠ HỘI VIỆC LÀM
          </h2>
          {jobData.jobs.map((job, i) => (
            <div
              key={i}
              className='mb-6 sm:mb-8 border-b border-gray-300 pb-4 sm:pb-6'
            >
              <h3 className='text-base sm:text-lg font-semibold mb-2 sm:mb-3 break-words'>
                {job.title}
              </h3>

              {/* Job details - Stack on mobile, inline on desktop */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-gray-600'>
                <span className='flex items-center gap-1 text-sm sm:text-base'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span className='break-words'>{job.type}</span>
                </span>

                <span className='flex items-start gap-1 text-sm sm:text-base'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.657 16.657L13.414 12.414a2 2 0 10-2.828 2.828l4.243 4.243a8 8 0 1111.314-11.314z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <span className='break-words'>{job.location}</span>
                </span>
              </div>

              <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600'>
                <span className='font-semibold flex items-center gap-1 text-sm sm:text-base'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 12v7'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19h6'
                    />
                  </svg>
                  <span>{job.salary}</span>
                </span>
                <span className='flex items-center gap-1 text-sm sm:text-base'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z'
                    />
                  </svg>
                  <span>{job.date}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
