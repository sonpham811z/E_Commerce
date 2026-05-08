import { useState, useEffect, useRef } from 'react';
import ProductSearch from './ProductSearch';
import { FiSearch, FiZap } from 'react-icons/fi';
import { useProductSearch } from './useProductSearch';
import Spinner from '../../ui/Spinner';

const PLACEHOLDERS = [
  'Hôm nay bạn muốn mua gì?',
  'Tìm laptop gaming giá rẻ...',
  'Màn hình cong 27 inch...',
  'Bàn phím cơ giá sinh viên...',
  'Tay cầm PS5 chính hãng...',
  'PC cấu hình cao chơi game...',
  'Tai nghe chống ồn xịn nhất...',
  'Chuột gaming nhẹ tay...',
];

const PLACEHOLDER_INTERVAL = 4000;

const Search = () => {
  const { query, setQuery, results, aiSuggestions, loading, searchRef } = useProductSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isFocused || query) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFade(true);
      }, 300);
    }, PLACEHOLDER_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [isFocused, query]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const hasResults = results.length > 0 || aiSuggestions.length > 0;

  return (
    <div ref={searchRef} className='relative w-full max-w-lg'>
      <div
        className={`bg-white flex items-center rounded-full px-6 py-2 transition-all duration-200 border ${
          isFocused
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-300'
            : 'border-gray-200 shadow-sm'
        }`}
      >
        <FiSearch
          size={18}
          className={`text-gray-400 mr-2 shrink-0 transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-60'
          }`}
        />

        <div className='relative flex-grow'>
          <input
            type='text'
            value={query}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => setQuery(e.target.value)}
            className='w-full outline-none text-gray-800 bg-transparent text-base'
            autoComplete='off'
          />
          {!query && !isFocused && (
            <span
              className={`absolute inset-0 flex items-center text-gray-400 text-base pointer-events-none transition-opacity duration-300 ${
                fade ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {PLACEHOLDERS[placeholderIdx]}
            </span>
          )}
          {!query && isFocused && (
            <span className='absolute inset-0 flex items-center text-gray-400 text-base pointer-events-none'>
              Tìm kiếm sản phẩm...
            </span>
          )}
        </div>
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className='absolute z-[1000] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex items-center justify-center py-5'>
          <Spinner />
        </div>
      )}

      {/* DROPDOWN KẾT QUẢ */}
      {!loading && hasResults && (
        <div className='absolute z-[1000] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto'>
          {/* AI GỢI Ý */}
          {aiSuggestions.length > 0 && (
            <div>
              <div className='flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100'>
                <FiZap size={14} className='text-purple-500' />
                <span className='text-xs font-semibold text-purple-600'>Gợi ý AI</span>
              </div>
              {aiSuggestions.map((item) => (
                <ProductSearch key={`ai-${item.id}`} product={item} />
              ))}
              {results.length > 0 && <div className='border-t border-gray-100' />}
            </div>
          )}

          {/* KẾT QUẢ CORE SERVICE */}
          {results.length > 0 && (
            <ul>
              {results.map((item) => (
                <li key={item.id}>
                  <ProductSearch product={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
