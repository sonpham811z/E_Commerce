import { supabase } from '@/components/services/supabase';

const formatCurrency = (amount) => {
  return amount.toLocaleString('vi-VN') + ' ₫';
};

const fallbackProvinces = [
  { value: '01', label: 'Thành phố Hà Nội' },
  { value: '02', label: 'Tỉnh Hà Giang' },
  { value: '04', label: 'Tỉnh Cao Bằng' },
  { value: '06', label: 'Tỉnh Bắc Kạn' },
  { value: '08', label: 'Tỉnh Tuyên Quang' },
  { value: '10', label: 'Tỉnh Lào Cai' },
  { value: '11', label: 'Tỉnh Điện Biên' },
  { value: '12', label: 'Tỉnh Lai Châu' },
  { value: '14', label: 'Tỉnh Sơn La' },
  { value: '15', label: 'Tỉnh Yên Bái' },
  { value: '17', label: 'Tỉnh Hòa Bình' },
  { value: '19', label: 'Tỉnh Thái Nguyên' },
  { value: '20', label: 'Tỉnh Lạng Sơn' },
  { value: '22', label: 'Tỉnh Quảng Ninh' },
  { value: '24', label: 'Tỉnh Bắc Giang' },
  { value: '25', label: 'Tỉnh Phú Thọ' },
  { value: '26', label: 'Tỉnh Vĩnh Phúc' },
  { value: '27', label: 'Tỉnh Bắc Ninh' },
  { value: '30', label: 'Tỉnh Hải Dương' },
  { value: '31', label: 'Thành phố Hải Phòng' },
  { value: '33', label: 'Tỉnh Hưng Yên' },
  { value: '34', label: 'Tỉnh Thái Bình' },
  { value: '35', label: 'Tỉnh Hà Nam' },
  { value: '36', label: 'Tỉnh Nam Định' },
  { value: '37', label: 'Tỉnh Ninh Bình' },
  { value: '38', label: 'Tỉnh Thanh Hóa' },
  { value: '40', label: 'Tỉnh Nghệ An' },
  { value: '42', label: 'Tỉnh Hà Tĩnh' },
  { value: '44', label: 'Tỉnh Quảng Bình' },
  { value: '45', label: 'Tỉnh Quảng Trị' },
  { value: '46', label: 'Tỉnh Thừa Thiên Huế' },
  { value: '48', label: 'Thành phố Đà Nẵng' },
  { value: '49', label: 'Tỉnh Quảng Nam' },
  { value: '51', label: 'Tỉnh Quảng Ngãi' },
  { value: '52', label: 'Tỉnh Bình Định' },
  { value: '54', label: 'Tỉnh Phú Yên' },
  { value: '56', label: 'Tỉnh Khánh Hòa' },
  { value: '58', label: 'Tỉnh Ninh Thuận' },
  { value: '60', label: 'Tỉnh Bình Thuận' },
  { value: '62', label: 'Tỉnh Kon Tum' },
  { value: '64', label: 'Tỉnh Gia Lai' },
  { value: '66', label: 'Tỉnh Đắk Lắk' },
  { value: '67', label: 'Tỉnh Đắk Nông' },
  { value: '68', label: 'Tỉnh Lâm Đồng' },
  { value: '70', label: 'Tỉnh Bình Phước' },
  { value: '72', label: 'Tỉnh Tây Ninh' },
  { value: '74', label: 'Tỉnh Bình Dương' },
  { value: '75', label: 'Tỉnh Đồng Nai' },
  { value: '77', label: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { value: '79', label: 'Thành phố Hồ Chí Minh' },
  { value: '80', label: 'Tỉnh Long An' },
  { value: '82', label: 'Tỉnh Tiền Giang' },
  { value: '83', label: 'Tỉnh Bến Tre' },
  { value: '84', label: 'Tỉnh Trà Vinh' },
  { value: '86', label: 'Tỉnh Vĩnh Long' },
  { value: '87', label: 'Tỉnh Đồng Tháp' },
  { value: '89', label: 'Tỉnh An Giang' },
  { value: '91', label: 'Tỉnh Kiên Giang' },
  { value: '92', label: 'Thành phố Cần Thơ' },
  { value: '93', label: 'Tỉnh Hậu Giang' },
  { value: '94', label: 'Tỉnh Sóc Trăng' },
  { value: '95', label: 'Tỉnh Bạc Liêu' },
  { value: '96', label: 'Tỉnh Cà Mau' }
];

const fallbackDistricts = {
  '01': [
    { value: '001', label: 'Quận Ba Đình' },
    { value: '002', label: 'Quận Hoàn Kiếm' },
    { value: '003', label: 'Quận Tây Hồ' },
    { value: '004', label: 'Quận Long Biên' },
    { value: '005', label: 'Quận Cầu Giấy' },
    { value: '006', label: 'Quận Đống Đa' },
    { value: '007', label: 'Quận Hai Bà Trưng' },
    { value: '008', label: 'Quận Hoàng Mai' },
    { value: '009', label: 'Quận Thanh Xuân' },
    { value: '016', label: 'Huyện Sóc Sơn' },
    { value: '017', label: 'Huyện Đông Anh' },
    { value: '018', label: 'Huyện Gia Lâm' },
    { value: '019', label: 'Quận Nam Từ Liêm' },
    { value: '020', label: 'Huyện Thanh Trì' },
    { value: '021', label: 'Quận Bắc Từ Liêm' },
    { value: '250', label: 'Huyện Mê Linh' },
    { value: '268', label: 'Quận Hà Đông' },
    { value: '269', label: 'Thị xã Sơn Tây' },
    { value: '271', label: 'Huyện Ba Vì' },
    { value: '272', label: 'Huyện Phúc Thọ' },
    { value: '273', label: 'Huyện Đan Phượng' },
    { value: '274', label: 'Huyện Hoài Đức' },
    { value: '275', label: 'Huyện Quốc Oai' },
    { value: '276', label: 'Huyện Thạch Thất' },
    { value: '277', label: 'Huyện Chương Mỹ' },
    { value: '278', label: 'Huyện Thanh Oai' },
    { value: '279', label: 'Huyện Thường Tín' },
    { value: '280', label: 'Huyện Phú Xuyên' },
    { value: '281', label: 'Huyện Ứng Hòa' },
    { value: '282', label: 'Huyện Mỹ Đức' }
  ],
  '79': [
    { value: '760', label: 'Quận 1' },
    { value: '761', label: 'Quận 12' },
    { value: '762', label: 'Quận Thủ Đức' },
    { value: '763', label: 'Quận 9' },
    { value: '764', label: 'Quận Gò Vấp' },
    { value: '765', label: 'Quận Bình Thạnh' },
    { value: '766', label: 'Quận Tân Bình' },
    { value: '767', label: 'Quận Tân Phú' },
    { value: '768', label: 'Quận Phú Nhuận' },
    { value: '769', label: 'Quận 2' },
    { value: '770', label: 'Quận 3' },
    { value: '771', label: 'Quận 10' },
    { value: '772', label: 'Quận 11' },
    { value: '773', label: 'Quận 4' },
    { value: '774', label: 'Quận 5' },
    { value: '775', label: 'Quận 6' },
    { value: '776', label: 'Quận 8' },
    { value: '777', label: 'Quận Bình Tân' },
    { value: '778', label: 'Quận 7' },
    { value: '783', label: 'Huyện Củ Chi' },
    { value: '784', label: 'Huyện Hóc Môn' },
    { value: '785', label: 'Huyện Bình Chánh' },
    { value: '786', label: 'Huyện Nhà Bè' },
    { value: '787', label: 'Huyện Cần Giờ' }
  ],
  '48': [
    { value: '490', label: 'Quận Liên Chiểu' },
    { value: '491', label: 'Quận Thanh Khê' },
    { value: '492', label: 'Quận Hải Châu' },
    { value: '493', label: 'Quận Sơn Trà' },
    { value: '494', label: 'Quận Ngũ Hành Sơn' },
    { value: '495', label: 'Quận Cẩm Lệ' },
    { value: '497', label: 'Huyện Hòa Vang' },
    { value: '498', label: 'Huyện Hoàng Sa' }
  ],
  '92': [
    { value: '916', label: 'Quận Ninh Kiều' },
    { value: '917', label: 'Quận Ô Môn' },
    { value: '918', label: 'Quận Bình Thủy' },
    { value: '919', label: 'Quận Cái Răng' },
    { value: '923', label: 'Quận Thốt Nốt' },
    { value: '924', label: 'Huyện Vĩnh Thạnh' },
    { value: '925', label: 'Huyện Cờ Đỏ' },
    { value: '926', label: 'Huyện Phong Điền' },
    { value: '927', label: 'Huyện Thới Lai' }
  ],
  '31': [
    { value: '303', label: 'Quận Hồng Bàng' },
    { value: '304', label: 'Quận Ngô Quyền' },
    { value: '305', label: 'Quận Lê Chân' },
    { value: '306', label: 'Quận Hải An' },
    { value: '307', label: 'Quận Kiến An' },
    { value: '308', label: 'Quận Đồ Sơn' },
    { value: '309', label: 'Quận Dương Kinh' },
    { value: '311', label: 'Huyện Thủy Nguyên' },
    { value: '312', label: 'Huyện An Dương' },
    { value: '313', label: 'Huyện An Lão' },
    { value: '314', label: 'Huyện Kiến Thụy' },
    { value: '315', label: 'Huyện Tiên Lãng' },
    { value: '316', label: 'Huyện Vĩnh Bảo' },
    { value: '317', label: 'Huyện Cát Hải' },
    { value: '318', label: 'Huyện Bạch Long Vĩ' }
  ],
};

const fallbackWards = {
  '001': [
    { value: '00001', label: 'Phường Phúc Xá' },
    { value: '00004', label: 'Phường Trúc Bạch' },
    { value: '00006', label: 'Phường Vĩnh Phúc' },
    { value: '00007', label: 'Phường Cống Vị' },
    { value: '00008', label: 'Phường Liễu Giai' },
    { value: '00010', label: 'Phường Nguyễn Trung Trực' },
    { value: '00013', label: 'Phường Quán Thánh' },
    { value: '00016', label: 'Phường Ngọc Hà' },
    { value: '00019', label: 'Phường Điện Biên' },
    { value: '00022', label: 'Phường Đội Cấn' },
    { value: '00025', label: 'Phường Ngọc Khánh' },
    { value: '00028', label: 'Phường Kim Mã' },
    { value: '00031', label: 'Phường Giảng Võ' },
    { value: '00034', label: 'Phường Thành Công' }
  ],
  '760': [
    { value: '26734', label: 'Phường Bến Nghé' },
    { value: '26737', label: 'Phường Bến Thành' },
    { value: '26740', label: 'Phường Cầu Kho' },
    { value: '26743', label: 'Phường Cầu Ông Lãnh' },
    { value: '26746', label: 'Phường Cô Giang' },
    { value: '26749', label: 'Phường Đa Kao' },
    { value: '26752', label: 'Phường Nguyễn Cư Trinh' },
    { value: '26755', label: 'Phường Nguyễn Thái Bình' },
    { value: '26758', label: 'Phường Phạm Ngũ Lão' },
    { value: '26761', label: 'Phường Tân Định' }
  ],
  '490': [
    { value: '20194', label: 'Phường Hòa Hiệp Bắc' },
    { value: '20195', label: 'Phường Hòa Hiệp Nam' },
    { value: '20197', label: 'Phường Hòa Khánh Bắc' },
    { value: '20198', label: 'Phường Hòa Khánh Nam' },
    { value: '20200', label: 'Phường Hòa Minh' }
  ],
};

export async function fetchAddress(tableName = 'products') {
  const { data, error } = await supabase.from(tableName).select('*');
  
  if (error) {
    console.error(`Error fetching ${tableName}:`, error.message);
    return [];
  }

  return data.map((item) => {
    const title = item.title?.replace(/-/g, ' ') || 'No Title';
    const brand = item.brand || 'Unknown';
    const salePrice = item.sale_price || 0;
    const originalPrice = item.original_price || Math.round(salePrice * 1.2);

    const discount =
      originalPrice && salePrice
        ? `${Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%`
        : '0%';

    return {
      id: item.id || '',
      title,
      brand,
      image: item.image || '',
      salePrice: formatCurrency(salePrice),
      originalPrice: formatCurrency(originalPrice),
      discount,
      rating: item.rating || 0,
      reviewCount: item.review_count || 0,
      thumbnail: item.thumbnails || '',
      description: item.description || '',
      detailImage: item.detail_image || '',
      performance: item.performance || '',
      extends: item.extends || '',
      category: tableName,
    };
  });
}

let addressDataPromise = null;

export function getAddressData() {
  if (!addressDataPromise) {
    addressDataPromise = fetch('/data.json').then(res => res.json());
  }
  return addressDataPromise;
}

export async function fetchProvinces() {
  try {
    const data = await getAddressData();
    return data.map(p => ({
      value: p.level1_id,
      label: p.name
    }));
  } catch (err) {
    console.error('Exception in fetchProvinces:', err);
    return fallbackProvinces;
  }
}

export async function fetchDistricts(provinceCode) {
  if (!provinceCode) return [];
  try {
    const data = await getAddressData();
    const province = data.find(p => p.level1_id === provinceCode);
    if (!province || !province.level2s) return fallbackDistricts[provinceCode] || [];
    return province.level2s.map(d => ({
      value: d.level2_id,
      label: d.name
    }));
  } catch (err) {
    console.error('Exception in fetchDistricts:', err);
    return fallbackDistricts[provinceCode] || [];
  }
}

export async function fetchWards(districtCode) {
  if (!districtCode) return [];
  try {
    const data = await getAddressData();
    for (const p of data) {
      if (p.level2s) {
        const district = p.level2s.find(d => d.level2_id === districtCode);
        if (district && district.level3s) {
          return district.level3s.map(w => ({
            value: w.level3_id,
            label: w.name
          }));
        }
      }
    }
    return fallbackWards[districtCode] || [];
  } catch (err) {
    console.error('Exception in fetchWards:', err);
    return fallbackWards[districtCode] || [];
  }
}

export async function getFullAddress(provinceCode, districtCode, wardCode) {
  try {
    const data = await getAddressData();
    let pName = 'Unknown Province';
    let dName = 'Unknown District';
    let wName = 'Unknown Ward';
    
    const province = data.find(p => p.level1_id === provinceCode);
    if (province) {
      pName = province.name;
      if (province.level2s) {
        const district = province.level2s.find(d => d.level2_id === districtCode);
        if (district) {
          dName = district.name;
          if (district.level3s) {
            const ward = district.level3s.find(w => w.level3_id === wardCode);
            if (ward) {
              wName = ward.name;
            }
          }
        }
      }
    }
    return {
      province: { name: pName, full_name: pName },
      district: { name: dName, full_name: dName },
      ward: { name: wName, full_name: wName }
    };
  } catch (error) {
    console.error('Error fetching address information:', error.message);
    return {
      province: { name: 'Unknown Province', full_name: 'Unknown Province' },
      district: { name: 'Unknown District', full_name: 'Unknown District' },
      ward: { name: 'Unknown Ward', full_name: 'Unknown Ward' }
    };
  }
}
