import { useState } from 'react';
import Modal from './Modal';
import { useGetProductsByCategory } from '../../hooks/useGetProductBuildPC';
import { convertKeysToCamelCase } from '../../../utils/caseConverter';
import ProductMiniCard from './ProductMiniCard';
import Spinner from '../../ui/Spinner';

function BuildPartRow({ partKey, name, image, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { products, loading } = useGetProductsByCategory(partKey);

  const handlePick = (item) => {
    onSelect(partKey, item);
    setOpen(false);
  };

  const displayedProducts = showAll ? products : products.slice(0, 10);

  return (
    <>
      <div className='flex items-center justify-between bg-white shadow rounded px-4 py-3'>
        <div className='flex items-center gap-4'>
          <img
            src={selected?.image || image}
            alt={name}
            className='w-12 h-12 object-contain'
          />
          <div className='flex-1'>
            <span className='font-medium text-gray-800 text-base'>{name}</span>
            {selected && (
              <p className='text-sm text-green-600 font-semibold line-clamp-1'>
                {selected.title}
              </p>
            )}
          </div>
        </div>

        {selected ? (
          <div className='flex flex-col items-end text-right'>
            <p className='text-xs text-gray-500 mb-1'>
              {Number(selected.salePrice).toLocaleString('vi-VN')} VND
            </p>
            <button
              onClick={() => onSelect(partKey, null)}
              className='text-sm text-red-500 hover:underline font-semibold mt-1.5'
            >
              Xoá
            </button>
          </div>
        ) : (
          <button
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
            onClick={() => setOpen(true)}
          >
            Chọn
          </button>
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Chọn ${name}`}
      >
        <>
          {loading ? (
            <div className='absolute inset-0 z-50 bg-white/80 flex items-center justify-center'>
              <Spinner className='w-10 h-10' color='text-red-500' />
            </div>
          ) : (
            <>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 overflow-y-auto px-2 flex-1'>
                {displayedProducts.map((item) => {
                  const camelItem = convertKeysToCamelCase(item);
                  return (
                    <ProductMiniCard
                      key={camelItem.id}
                      id={camelItem.id}
                      title={camelItem.title}
                      image={camelItem.image}
                      salePrice={camelItem.salePrice}
                      originalPrice={camelItem.originalPrice}
                      onSelect={() => handlePick(camelItem)}
                      onViewDetail={() =>
                        window.open(`/san-pham/${camelItem.id}`, '_blank')
                      }
                    />
                  );
                })}
              </div>
              {!loading && products.length > 10 && (
                <div className='text-center mt-4'>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className='mt-4 mx-auto text-sm text-red-600 border border-red-500 px-4 py-1.5 rounded hover:bg-red-50 transition'
                  >
                    {showAll ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      </Modal>
    </>
  );
}

export default BuildPartRow;
