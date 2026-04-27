const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push('ellipsis-1');
      for (
        let i = Math.max(2, currentPage - 2);
        i <= Math.min(totalPages - 1, currentPage + 2);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push('ellipsis-2');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageList = generatePageNumbers();

  return (
    <div className='flex items-center justify-center gap-1 py-4 overflow-x-auto scrollbar-thin'>
      {pageList.map((page, idx) =>
        page === 'ellipsis-1' || page === 'ellipsis-2' ? (
          <span key={`ellipsis-${idx}`} className='px-2 text-gray-400'>
            ...
          </span>
        ) : (
          <button
            key={`page-${page}-${idx}`}
            className={`px-3 py-1.5 rounded border text-sm ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
};

export default Pagination;
