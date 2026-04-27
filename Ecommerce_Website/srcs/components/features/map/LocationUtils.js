import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle, Fill, Stroke } from "ol/style";

export const GEARVN_HQ = [106.6835, 10.7631];

export const provinceCoordinates = {
  "Thành phố Hồ Chí Minh": [106.6297, 10.8231],
  "Thành phố Hà Nội": [105.8342, 21.0278],
  "Thành phố Đà Nẵng": [108.2022, 16.0544],
  "Thành phố Cần Thơ": [105.7558, 10.0341],
  "Thành phố Hải Phòng": [106.6881, 20.8449],
  
  "Hà Giang": [104.9804, 22.8266],
  "Cao Bằng": [106.2586, 22.6666],
  "Bắc Kạn": [105.8341, 22.1471],
  "Tuyên Quang": [105.2181, 21.8214],
  "Lào Cai": [103.9756, 22.4856],
  "Điện Biên": [103.0169, 21.3856],
  "Lai Châu": [103.4567, 22.3964],
  "Sơn La": [103.7288, 21.1679],
  "Yên Bái": [104.6681, 21.7226],
  "Hoà Bình": [105.3385, 20.8133],
  "Thái Nguyên": [105.8448, 21.5941],
  "Lạng Sơn": [106.7612, 21.8534],
  "Quảng Ninh": [107.9804, 21.0066],
  "Bắc Giang": [106.1934, 21.2738],
  "Phú Thọ": [105.2274, 21.3984],
  "Vĩnh Phúc": [105.6054, 21.3009],
  "Bắc Ninh": [106.0766, 21.1861],
  "Hải Dương": [106.3119, 20.9374],
  "Hưng Yên": [106.0516, 20.6464],
  "Thái Bình": [106.3452, 20.4478],
  "Hà Nam": [105.9219, 20.5835],
  "Nam Định": [106.1687, 20.4196],
  "Ninh Bình": [105.9753, 20.2544],
  "Thanh Hóa": [105.7687, 19.8066],
  "Nghệ An": [104.9573, 19.2346],
  "Hà Tĩnh": [105.9009, 18.3559],
  "Quảng Bình": [106.3489, 17.5458],
  "Quảng Trị": [107.1879, 16.7943],
  "Thừa Thiên Huế": [107.5905, 16.4635],
  "Quảng Nam": [108.1948, 15.5394],
  "Quảng Ngãi": [108.8076, 15.1201],
  "Bình Định": [108.9734, 14.1656],
  "Phú Yên": [109.0928, 13.1610],
  "Khánh Hòa": [109.1948, 12.2985],
  "Ninh Thuận": [108.9860, 11.6738],
  "Bình Thuận": [108.1009, 11.0904],
  "Kon Tum": [108.0077, 14.3497],
  "Gia Lai": [108.2845, 13.7749],
  "Đắk Lắk": [108.0451, 12.7100],
  "Đắk Nông": [107.7347, 12.2646],
  "Lâm Đồng": [108.4429, 11.9408],
  "Bình Phước": [106.9249, 11.7511],
  "Tây Ninh": [106.1304, 11.3103],
  "Bình Dương": [106.6776, 11.3254],
  "Đồng Nai": [107.1675, 11.0686],
  "Bà Rịa - Vũng Tàu": [107.2429, 10.4542],
  "Long An": [106.5452, 10.5395],
  "Tiền Giang": [106.3494, 10.3702],
  "Bến Tre": [106.3756, 10.2433],
  "Trà Vinh": [106.3463, 9.9369],
  "Vĩnh Long": [106.0012, 10.2537],
  "Đồng Tháp": [105.6976, 10.4937],
  "An Giang": [105.1258, 10.5216],
  "Kiên Giang": [105.0851, 10.0211],
  "Cần Thơ": [105.7839, 10.0341],
  "Hậu Giang": [105.6412, 9.7868],
  "Sóc Trăng": [105.9719, 9.6037],
  "Bạc Liêu": [105.7283, 9.2515],
  "Cà Mau": [105.1508, 9.1769],
};

export const hcmDistrictCoordinates = {
  "Thủ Đức": [106.7698, 10.8231],
  "Linh Trung": [106.7734, 10.8711],
  "Quận 1": [106.7020, 10.7756],
  "Quận 2": [106.7477, 10.7868],
  "Quận 3": [106.6839, 10.7804],
  "Quận 4": [106.7057, 10.7573],
  "Quận 5": [106.6671, 10.7539],
  "Quận 6": [106.6367, 10.7481],
  "Quận 7": [106.7009, 10.7392],
  "Quận 8": [106.6285, 10.7214],
  "Quận 9": [106.8316, 10.8431],
  "Quận 10": [106.6683, 10.7728],
  "Quận 11": [106.6501, 10.7639],
  "Quận 12": [106.6413, 10.8667],
  "Bình Tân": [106.6018, 10.7654],
  "Bình Thạnh": [106.7096, 10.8113],
  "Gò Vấp": [106.6966, 10.8385],
  "Phú Nhuận": [106.6824, 10.7999],
  "Tân Bình": [106.6527, 10.8026],
  "Tân Phú": [106.6232, 10.7935],
  "Tây Thạnh": [106.6167, 10.8168],
  "Bình Chánh": [106.5432, 10.6901],
  "Cần Giờ": [106.9510, 10.4113],
  "Củ Chi": [106.4938, 11.0237],
  "Hóc Môn": [106.5924, 10.8869],
  "Nhà Bè": [106.7080, 10.6684]
};

export const getLocationFromIP = async () => {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    console.log("IP Location data:", data);
    
    if (data && data.latitude && data.longitude) {
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return [longitude, latitude]; 
      }
    }
    
    if (data && data.city && provinceCoordinates[data.city]) {
      return provinceCoordinates[data.city];
    }
    
    return [106.6297, 10.8231];
  } catch (error) {
    console.error("Error fetching IP location:", error);
    return [106.6297, 10.8231];
  }
};

export const getAddressCoordinates = (address) => {
  let coordinates = [106.6297, 10.8231];
  
  if (!address) return coordinates;
  
  const isHCMCity = (cityName) => {
    if (!cityName) return false;
    const lcCityName = cityName.toLowerCase();
    return lcCityName.includes('hồ chí minh') || 
           lcCityName.includes('ho chi minh') || 
           lcCityName.includes('hcm') || 
           lcCityName.includes('tp.hcm') || 
           lcCityName.includes('tphcm');
  };
  
  const containsLocation = (text, locationName) => {
    if (!text || !locationName) return false;
    return text.toLowerCase().includes(locationName.toLowerCase());
  };

  let addressStr = '';
  let district = '';
  let city = '';
  
  if (typeof address === 'object') {
    district = address.district || address.districtName || '';
    city = address.city || address.cityName || '';
    
    const addressParts = [];
    if (address.street || address.address) addressParts.push(address.street || address.address);
    if (address.ward || address.wardName) addressParts.push(address.ward || address.wardName);
    if (district) addressParts.push(district);
    if (city) addressParts.push(city);
    
    addressStr = addressParts.join(', ');
  } else if (typeof address === 'string') {
    addressStr = address;
    
    const parts = addressStr.split(',').map(part => part.trim());
    
    for (const part of parts) {
      if (isHCMCity(part)) {
        city = 'Thành phố Hồ Chí Minh';
        break;
      }
      
      for (const provinceName of Object.keys(provinceCoordinates)) {
        if (containsLocation(part, provinceName)) {
          city = provinceName;
          break;
        }
      }
    }
  }
  
  console.log("Processing address:", addressStr);
  
  if (containsLocation(addressStr, 'Linh Trung')) {
    console.log("Found Linh Trung in address");
    return hcmDistrictCoordinates["Linh Trung"];
  }
  
  if (containsLocation(addressStr, 'Thủ Đức') || containsLocation(addressStr, 'Thu Duc')) {
    console.log("Found Thu Duc in address");
    return hcmDistrictCoordinates["Thủ Đức"];
  }
  
  if (isHCMCity(city) || containsLocation(addressStr, 'Hồ Chí Minh')) {
    console.log("Address is in HCM, checking districts");
    
    for (const [districtName, coords] of Object.entries(hcmDistrictCoordinates)) {
      if (containsLocation(addressStr, districtName) || 
          (district && containsLocation(district, districtName))) {
        console.log(`Found district: ${districtName}`);
        return coords;
      }
    }
    
    return provinceCoordinates["Thành phố Hồ Chí Minh"];
  }
  
  for (const [province, coords] of Object.entries(provinceCoordinates)) {
    if (containsLocation(addressStr, province) || 
        (city && containsLocation(city, province))) {
      return coords;
    }
  }
  
  const randomOffset = () => (Math.random() - 0.5) * 0.01;
  return [coordinates[0] + randomOffset(), coordinates[1] + randomOffset()];
};

export const markerUrls = {
  default: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDMyIDQ4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNlNTQ5NGQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgZD0iTTE2LjE1NCAwQzcuODc4IDAgMS4wNDUgNi43NDMgMS4wNDUgMTUuMDE5YzAgNC4zNjggMi45MTQgOS4xNzggNi4xODUgMTIuNTI3IDMuNDI4IDMuNTE3IDcuNjY2IDkuMjA0IDguMDk1IDE5LjE0Ni4yNzIgNC41MDIuNDU5IDEuMDk3Ljc3NCAwIDEuNTctNS40MDQgNS4wNTQtMTIuMDIyIDguOTc5LTE5LjE0NiAyLjQxNC00LjM2OCA3LjAyLTcuODIyIDcuMDItMTIuNTI3QzMyLjA5OCA2Ljc0MyAyNS4yNzEgMCAxNi4xNTQgMHoiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE1IiByPSI2IiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE2LjA0OCA0MWM0LjE4OSAwIDcuNTg0LTMuMzk1IDcuNTg0LTcuNTg0cy0zLjM5NS03LjU4NC03LjU4NC03LjU4NC03LjU4NCAzLjM5NS03LjU4NCA3LjU4NCAzLjM5NSA3LjU4NCA3LjU4NCA3LjU4NHoiLz48L2c+PC9zdmc+",
  delivery: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDMyIDQ4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMDdiZmYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgZD0iTTE2LjE1NCAwQzcuODc4IDAgMS4wNDUgNi43NDMgMS4wNDUgMTUuMDE5YzAgNC4zNjggMi45MTQgOS4xNzggNi4xODUgMTIuNTI3IDMuNDI4IDMuNTE3IDcuNjY2IDkuMjA0IDguMDk1IDE5LjE0Ni4yNzIgNC41MDIuNDU5IDEuMDk3Ljc3NCAwIDEuNTctNS40MDQgNS4wNTQtMTIuMDIyIDguOTc5LTE5LjE0NiAyLjQxNC00LjM2OCA3LjAyLTcuODIyIDcuMDItMTIuNTI3QzMyLjA5OCA2Ljc0MyAyNS4yNzEgMCAxNi4xNTQgMHoiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE1IiByPSI2IiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE2LjA0OCA0MWM0LjE4OSAwIDcuNTg0LTMuMzk1IDcuNTg0LTcuNTg0cy0zLjM5NS03LjU4NC03LjU4NC03LjU4NC03LjU4NCAzLjM5NS03LjU4NCA3LjU4NCAzLjM5NSA3LjU4NCA3LjU4NCA3LjU4NHoiLz48L2c+PC9zdmc+",
  headquarters: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDMyIDQ4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM0Y2FmNTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgZD0iTTE2LjE1NCAwQzcuODc4IDAgMS4wNDUgNi43NDMgMS4wNDUgMTUuMDE5YzAgNC4zNjggMi45MTQgOS4xNzggNi4xODUgMTIuNTI3IDMuNDI4IDMuNTE3IDcuNjY2IDkuMjA0IDguMDk1IDE5LjE0Ni4yNzIgNC41MDIuNDU5IDEuMDk3Ljc3NCAwIDEuNTctNS40MDQgNS4wNTQtMTIuMDIyIDguOTc5LTE5LjE0NiAyLjQxNC00LjM2OCA3LjAyLTcuODIyIDcuMDItMTIuNTI3QzMyLjA5OCA2Ljc0MyAyNS4yNzEgMCAxNi4xNTQgMHoiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE1IiByPSI2IiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE2LjA0OCA0MWM0LjE4OSAwIDcuNTg0LTMuMzk1IDcuNTg0LTcuNTg0cy0zLjM5NS03LjU4NC03LjU4NC03LjU4NC03LjU4NCAzLjM5NS03LjU4NCA3LjU4NCAzLjM5NSA3LjU4NCA3LjU4NCA3LjU4NHoiLz48L2c+PC9zdmc+"  
};

export const getStoreLocations = (addressData, deliveryAddress) => {
  let deliveryCoordinates;
  
  if (deliveryAddress) {
    deliveryCoordinates = getAddressCoordinates(deliveryAddress);
  } else if (addressData) {
    deliveryCoordinates = getAddressCoordinates(addressData);
  } else {
    deliveryCoordinates = [106.6297, 10.8231];
  }
  
  return [
    ...((!addressData && !deliveryAddress) ? [{
      name: "Trụ sở chính GearVN",
      coordinates: GEARVN_HQ,
      address: "378 Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh",
      isHeadquarters: true
    }] : []),
    
    ...(addressData || deliveryAddress ? [{
      name: "Vị trí giao hàng",
      coordinates: deliveryCoordinates,
      address: deliveryAddress || 
              (addressData?.fullAddress || 
              `${addressData?.street || addressData?.address || ''}, ${addressData?.wardName || addressData?.ward || ''}, ${addressData?.districtName || addressData?.district || ''}, ${addressData?.cityName || addressData?.city || ''}`) ||
              "Địa chỉ không xác định",
      isDeliveryPoint: true
    }] : []),
    
    {
      name: "GearVN Chi nhánh Quận 7",
      coordinates: [106.700981, 10.776889],
      address: "123 Đường Nguyễn Văn Linh, Quận 7, TP. HCM",
    },
    {
      name: "GearVN Chi nhánh Quận 10",
      coordinates: [106.6980, 10.7857],
      address: "456 Đường 3/2, Quận 10, TP. HCM",
    },
  ];
};

export const createIpLocationFeature = (coordinates) => {
  const feature = new Feature({
    geometry: new Point(fromLonLat(coordinates)),
    name: "Vị trí khu vực của bạn",
    address: "Vị trí dựa trên IP của bạn",
    isIpLocation: true
  });
  
  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 165, 0, 0.7)'  // Orange color
        }),
        stroke: new Stroke({
          color: 'white',
          width: 1.5
        })
      })
    })
  );

  return feature;
}; 