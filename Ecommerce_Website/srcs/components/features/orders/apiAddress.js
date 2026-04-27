import { supabase } from '@/components/services/supabase';

const formatCurrency = (amount) => {
  return amount.toLocaleString('vi-VN') + ' ₫';
};

const fallbackProvinces = [
  { value: '01', label: 'Thành phố Hà Nội' },
  { value: '79', label: 'Thành phố Hồ Chí Minh' },
  { value: '48', label: 'Thành phố Đà Nẵng' },
  { value: '92', label: 'Thành phố Cần Thơ' },
  { value: '31', label: 'Thành phố Hải Phòng' },
];

const fallbackDistricts = {
  '01': [
    { value: '001', label: 'Quận Ba Đình' },
    { value: '002', label: 'Quận Hoàn Kiếm' },
    { value: '003', label: 'Quận Tây Hồ' },
    { value: '004', label: 'Quận Long Biên' },
  ],
  '79': [
    { value: '760', label: 'Quận 1' },
    { value: '761', label: 'Quận 12' },
    { value: '764', label: 'Quận Gò Vấp' },
    { value: '765', label: 'Quận Bình Thạnh' },
    { value: '766', label: 'Quận Tân Bình' },
    { value: '767', label: 'Quận Tân Phú' },
  ],
  '48': [
    { value: '490', label: 'Quận Liên Chiểu' },
    { value: '491', label: 'Quận Thanh Khê' },
    { value: '492', label: 'Quận Hải Châu' },
    { value: '493', label: 'Quận Sơn Trà' },
  ],
  '92': [
    { value: '916', label: 'Quận Ninh Kiều' },
    { value: '917', label: 'Quận Ô Môn' },
    { value: '918', label: 'Quận Bình Thủy' },
  ],
  '31': [
    { value: '303', label: 'Quận Hồng Bàng' },
    { value: '304', label: 'Quận Ngô Quyền' },
    { value: '305', label: 'Quận Lê Chân' },
  ],
};

const fallbackWards = {
  '001': [
    { value: '00001', label: 'Phường Phúc Xá' },
    { value: '00004', label: 'Phường Trúc Bạch' },
    { value: '00006', label: 'Phường Vĩnh Phúc' },
  ],
  '760': [
    { value: '26734', label: 'Phường Bến Nghé' },
    { value: '26737', label: 'Phường Bến Thành' },
    { value: '26740', label: 'Phường Cầu Kho' },
  ],
  '490': [
    { value: '20194', label: 'Phường Hòa Hiệp Bắc' },
    { value: '20195', label: 'Phường Hòa Hiệp Nam' },
    { value: '20197', label: 'Phường Hòa Khánh Bắc' },
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

export async function fetchProvinces() {
  try {
    const { data, error } = await supabase
      .from('provinces')
      .select('code, name, full_name')
      .order('name');
    
    if (error) {
      console.error('Error fetching provinces:', error.message);
      console.log('Using fallback provinces data');
      return fallbackProvinces;
    }

    if (!data || data.length === 0) {
      console.log('No provinces data from Supabase, using fallback');
      return fallbackProvinces;
    }

    return data.map(province => ({
      value: province.code,
      label: province.name
    }));
  } catch (err) {
    console.error('Exception in fetchProvinces:', err);
    return fallbackProvinces;
  }
}

export async function fetchDistricts(provinceCode) {
  if (!provinceCode) return [];
  
  try {
    const { data, error } = await supabase
      .from('districts')
      .select('code, name, full_name')
      .eq('province_code', provinceCode)
      .order('name');
    
    if (error) {
      console.error('Error fetching districts:', error.message);
      console.log('Using fallback districts data for province', provinceCode);
      return fallbackDistricts[provinceCode] || [];
    }

    if (!data || data.length === 0) {
      console.log('No districts data from Supabase, using fallback for province', provinceCode);
      return fallbackDistricts[provinceCode] || [];
    }

    return data.map(district => ({
      value: district.code,
      label: district.name
    }));
  } catch (err) {
    console.error('Exception in fetchDistricts:', err);
    return fallbackDistricts[provinceCode] || [];
  }
}

export async function fetchWards(districtCode) {
  if (!districtCode) return [];
  
  try {
    const { data, error } = await supabase
      .from('wards')
      .select('code, name, full_name')
      .eq('district_code', districtCode)
      .order('name');
    
    if (error) {
      console.error('Error fetching wards:', error.message);
      console.log('Using fallback wards data for district', districtCode);
      return fallbackWards[districtCode] || [];
    }

    if (!data || data.length === 0) {
      console.log('No wards data from Supabase, using fallback for district', districtCode);
      return fallbackWards[districtCode] || [];
    }

    return data.map(ward => ({
      value: ward.code,
      label: ward.name
    }));
  } catch (err) {
    console.error('Exception in fetchWards:', err);
    return fallbackWards[districtCode] || [];
  }
}

export async function getFullAddress(provinceCode, districtCode, wardCode) {
  try {
    const { data: provinceData, error: provinceError } = await supabase
      .from('provinces')
      .select('name, full_name')
      .eq('code', provinceCode)
      .single();
    
    if (provinceError) throw provinceError;
    
    const { data: districtData, error: districtError } = await supabase
      .from('districts')
      .select('name, full_name')
      .eq('code', districtCode)
      .single();
    
    if (districtError) throw districtError;
    
    const { data: wardData, error: wardError } = await supabase
      .from('wards')
      .select('name, full_name')
      .eq('code', wardCode)
      .single();
    
    if (wardError) throw wardError;
    
    return {
      province: provinceData,
      district: districtData,
      ward: wardData
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
