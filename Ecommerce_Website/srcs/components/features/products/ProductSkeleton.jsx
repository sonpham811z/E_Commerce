const ProductSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 animate-pulse bg-white">
      <div className="w-full h-40 bg-gray-200 mb-4 rounded" />
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded" />
        <div className="flex-1 h-10 bg-gray-300 rounded" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
