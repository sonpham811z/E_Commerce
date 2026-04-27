import React from "react";

const MapLegend = ({ ipLocation, ipLocationLoading, showRoute = false }) => {
  return (
    <div className="mt-3 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-100">
      <div className="font-medium mb-1">Chú thích:</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
          <span>Vị trí giao hàng</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          <span>Trụ sở GearVN</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-orange-400 rounded-full mr-1"></span>
          <span>Vị trí khu vực (IP)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-1"></span>
          <span>Vị trí chính xác (GPS)</span>
        </div>
        {showRoute && (
          <div className="flex items-center col-span-2">
            <span className="inline-block w-8 h-1 bg-blue-500 mr-1" style={{ borderTop: '1px dashed #0082c8' }}></span>
            <span>Đường đi ngắn nhất</span>
          </div>
        )}
      </div>
      
      {ipLocationLoading && (
        <div className="mt-1 text-xs text-gray-500">
          Đang xác định vị trí...
        </div>
      )}
      
      {ipLocation && (
        <div className="text-xs text-green-600 mt-1">
          <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
          Đã xác định vị trí khu vực của bạn
        </div>
      )}
    </div>
  );
};

export default MapLegend; 