import { useState } from 'react';
import ProductSearch from './ProductSearch';
import { FiSearch } from 'react-icons/fi';
import { useProductSearch } from './useProductSearch';
import Spinner from '../../ui/Spinner';

const Search = () => {
  const { query, setQuery, results, loading, searchRef } = useProductSearch();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div ref={searchRef} className='relative w-full max-w-lg'>
      <div
        className={`bg-white flex items-center rounded-full px-6 py-2 transition-all duration-200 border ${
          isFocused
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-300'
            : 'border-gray-200 shadow-sm'
        }`}
      >
        {/* ICON 🔍 */}
        <FiSearch
          size={18}
          className={`text-gray-500 mr-2 transform transition-all duration-200 ${
            isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        />

        {/* INPUT */}
        <input
          type='text'
          placeholder='Tìm kiếm sản phẩm...'
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          className='flex-grow outline-none text-gray-800 bg-transparent text-base placeholder:text-gray-500'
          autoComplete='off'
        />
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className='absolute z-[1000] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex items-center justify-center py-5'>
          <Spinner />
        </div>
      )}

      {/* DROPDOWN KẾT QUẢ */}
      {!loading && results.length > 0 && (
        <ul className='absolute z-[1000] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto'>
          {results.map((item) => (
            <li key={item.id}>
              <ProductSearch product={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
