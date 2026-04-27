import Icon from '@/components/ui/Icon';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Constants được tách ra ngoài để tránh re-render không cần thiết
const BRANDS = [
  'Tất cả',
  'AMD',
  'Intel',
  'Asus',
  'Acer',
  'Giga',
  'HP',
  'Lenovo',
  'MSI',
  'Dell',
  'Apple',
];
const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
];

const FILTER_OPTIONS = {
  Giá: ['5-9 triệu', '9-15 triệu', 'trên 15 triệu'],
  'Dòng CPU': ['AMD Ryzen', 'Intel Core i7', 'Intel Core i9'],
  Socket: ['LGA 1200', 'AM4', 'LGA 1700'],
};

const KEY_MAP = {
  Giá: 'priceRange',
  'Dòng CPU': 'cpu',
  Socket: 'socket',
};

const ProductFilters = ({
  selectedBrand,
  onBrandChange,
  sortBy,
  onSortChange,
  onFilterChange,
  onSearchChange, // Thêm prop cho search
}) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filterRef = useRef(null);

  // Sử dụng useCallback để tối ưu performance
  const handleClickOutside = useCallback((event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setActiveFilter(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleFilterClick = useCallback((label) => {
    setActiveFilter((prev) => (prev === label ? null : label));
  }, []);

  const handleOptionSelect = useCallback(
    (label, option) => {
      onFilterChange(KEY_MAP[label], option);
      setActiveFilter(null);
    },
    [onFilterChange]
  );

  const handleBrandChange = useCallback(
    (brand) => {
      onBrandChange(brand.toLowerCase());
    },
    [onBrandChange]
  );

  // Debounced search để tránh gọi API quá nhiều
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange?.(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearchChange]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize các component con để tránh re-render
  const brandButtons = useMemo(
    () =>
      BRANDS.map((brand) => (
        <button
          key={brand}
          onClick={() => handleBrandChange(brand)}
          className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
            selectedBrand === brand.toLowerCase()
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
          }`}
        >
          {brand}
        </button>
      )),
    [selectedBrand, handleBrandChange]
  );

  const filterButtons = useMemo(
    () =>
      Object.keys(FILTER_OPTIONS).map((label) => (
        <div key={label} className='relative'>
          <button
            onClick={() => handleFilterClick(label)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-2 ${
              activeFilter === label
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
            }`}
            aria-expanded={activeFilter === label}
            aria-haspopup='listbox'
          >
            {label}
            <Icon
              name='chevron-down'
              className={`w-4 h-4 text-gray-400 transition-transform ${
                activeFilter === label ? 'rotate-180' : ''
              }`}
            />
          </button>
          {activeFilter === label && (
            <ul
              className='absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-20 w-48 overflow-hidden'
              role='listbox'
            >
              {FILTER_OPTIONS[label].map((option) => (
                <li
                  key={option}
                  onClick={() => handleOptionSelect(label, option)}
                  className='px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer transition-colors'
                  role='option'
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )),
    [activeFilter, handleFilterClick, handleOptionSelect]
  );

  return (
    <div className='bg-white rounded-2xl p-6 shadow-md space-y-6'>
      {/* Thương hiệu */}
      <div className='flex flex-wrap items-center gap-2'>
        <span className='font-semibold text-gray-700 mb-2 sm:mb-0'>
          Thương hiệu:
        </span>
        {brandButtons}
      </div>

      {/* Bộ lọc nâng cao */}
      <div className='flex flex-wrap items-center gap-4' ref={filterRef}>
        <span className='font-semibold text-gray-700 mb-2 sm:mb-0'>
          Bộ lọc nâng cao:
        </span>
        {filterButtons}
      </div>

      {/* Search + Sort */}
      <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
        <div className='relative w-full lg:w-1/2'>
          <input
            type='text'
            placeholder='Tìm kiếm sản phẩm...'
            value={searchTerm}
            onChange={handleSearchChange}
            className='w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors'
            aria-label='Tìm kiếm sản phẩm'
          />
          <Icon
            name='search'
            className='absolute left-3 top-2.5 text-gray-400 pointer-events-none'
          />
        </div>
        <div className='flex items-center gap-2 w-full lg:w-auto'>
          <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>
            Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors flex-1 lg:flex-none'
            aria-label='Sắp xếp sản phẩm'
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

// Component hiển thị các bộ lọc đang được áp dụng - đã tối ưu
export const ActiveFilters = ({
  selectedBrand,
  filters,
  onClearBrand,
  onClearFilter,
  onClearAll,
}) => {
  const hasFilters = useMemo(
    () =>
      selectedBrand !== 'all' ||
      filters.priceRange ||
      filters.cpu ||
      filters.socket,
    [selectedBrand, filters]
  );

  const handleClearBrand = useCallback(() => {
    onClearBrand();
  }, [onClearBrand]);

  const handleClearFilter = useCallback(
    (filterType) => {
      onClearFilter(filterType);
    },
    [onClearFilter]
  );

  if (!hasFilters) return null;

  return (
    <div className='mb-6 flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow'>
      <span className='font-semibold text-gray-700 mb-2 sm:mb-0'>
        Đang lọc:
      </span>

      {selectedBrand !== 'all' && (
        <FilterTag
          label={`Thương hiệu: ${selectedBrand}`}
          onClear={handleClearBrand}
          colorClass='bg-blue-100 text-blue-800'
          clearColorClass='text-blue-500 hover:text-blue-700'
        />
      )}

      {filters.priceRange && (
        <FilterTag
          label={`Giá: ${filters.priceRange}`}
          onClear={() => handleClearFilter('priceRange')}
          colorClass='bg-green-100 text-green-800'
          clearColorClass='text-green-500 hover:text-green-700'
        />
      )}

      {filters.cpu && (
        <FilterTag
          label={`CPU: ${filters.cpu}`}
          onClear={() => handleClearFilter('cpu')}
          colorClass='bg-purple-100 text-purple-800'
          clearColorClass='text-purple-500 hover:text-purple-700'
        />
      )}

      {filters.socket && (
        <FilterTag
          label={`Socket: ${filters.socket}`}
          onClear={() => handleClearFilter('socket')}
          colorClass='bg-yellow-100 text-yellow-800'
          clearColorClass='text-yellow-500 hover:text-yellow-700'
        />
      )}

      <button
        onClick={onClearAll}
        className='ml-auto text-sm text-red-500 hover:text-red-700 hover:underline transition-colors'
      >
        Xoá tất cả
      </button>
    </div>
  );
};

// Component con để tối ưu re-render
const FilterTag = ({ label, onClear, colorClass, clearColorClass }) => (
  <span
    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${colorClass}`}
  >
    {label}
    <button
      onClick={onClear}
      className={`font-bold ml-1 transition-colors ${clearColorClass}`}
      aria-label={`Xóa bộ lọc ${label}`}
    >
      ✕
    </button>
  </span>
);
