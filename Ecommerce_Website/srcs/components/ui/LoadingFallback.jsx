// Simple loading fallback for Suspense
export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-64">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-red-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Đang tải...</p>
      </div>
    </div>
  );
}
