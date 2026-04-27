import React from "react";
import { createUserLocationFeature } from "./MarkerLayer";
import { fromLonLat } from "ol/proj";

const LocationControls = ({ 
  map, 
  detectUserLocation, 
  hasLocation, 
  locationError, 
  ipLocation, 
  ipLocationLoading
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-600">
          <p>
            Nhấp vào bản đồ để xem thông tin chi tiết. 
            {ipLocationLoading && "Đang xác định vị trí..."}
            {map && !ipLocation && !ipLocationLoading && "Sẵn sàng xác định vị trí."}
          </p>
          {ipLocation && (
            <p className="text-xs text-green-600 mt-1">
              <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
              Đã xác định vị trí khu vực của bạn
            </p>
          )}
        </div>
        <button 
          onClick={detectUserLocation}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md flex items-center shadow-md transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Định vị chính xác
        </button>
      </div>
      
      {/* Show location error if any */}
      {locationError && (
        <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
          {locationError}
        </div>
      )}
      
      {/* Show success message when location is found */}
      {hasLocation && (
        <div className="mt-2 p-2 bg-green-50 text-green-800 text-sm rounded-md border border-green-200">
          Đã xác định được vị trí chính xác của bạn thành công.
        </div>
      )}
    </div>
  );
};

export const handleUserLocationDetection = (map, setLocationError, setHasLocation) => {
  setLocationError(null);
  setHasLocation(false);

  if (!navigator.geolocation) {
    setLocationError("Trình duyệt của bạn không hỗ trợ định vị.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = [position.coords.longitude, position.coords.latitude];
      setHasLocation(true);

      if (map) {
        const accuracyFeature = createUserLocationFeature(coords);

        const layers = map.getLayers().getArray();
        const vectorLayer = layers.find(layer => layer.getSource && layer.getSource().getFeatures);
        if (vectorLayer) {
          const source = vectorLayer.getSource();
          source.getFeatures().forEach(feature => {
            if (feature.get('isUserLocation')) {
              source.removeFeature(feature);
            }
          });
          source.addFeature(accuracyFeature);
        }

        const view = map.getView();
        view.animate({
          center: fromLonLat(coords),
          duration: 1000
        });
      }
    },
    (error) => {
      if (error.code !== 1) {
        console.error("Geolocation error:", error);
      }
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError(
            <div>
              <p>Bạn đã từ chối quyền truy cập vị trí.</p>
              <p className="text-xs mt-2">
                Để kích hoạt: Nhấn vào biểu tượng khóa/địa chỉ trên trình duyệt, 
                chọn "Quyền truy cập" và cho phép vị trí.
              </p>
            </div>
          );
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError("Thông tin vị trí không khả dụng.");
          break;
        case error.TIMEOUT:
          setLocationError("Yêu cầu vị trí đã hết thời gian chờ.");
          break;
        default:
          setLocationError("Đã xảy ra lỗi không xác định.");
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

export default LocationControls; 