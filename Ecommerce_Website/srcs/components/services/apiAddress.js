import { supabase } from "./supabase";

export async function registerAddressForm({ addressData }) {
  // Get full address names before saving
  try {
    let provinceName = "", districtName = "", wardName = "";
    
    // Ưu tiên sử dụng tên đã được cung cấp từ client
    if (addressData.cityName && addressData.districtName && addressData.wardName) {
      provinceName = addressData.cityName;
      districtName = addressData.districtName;
      wardName = addressData.wardName;
    } else {
      // Xử lý trường hợp chỉ có mã mà không có tên
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        
        const province = data.find(p => p.level1_id === addressData.city);
        if (province) {
          provinceName = province.name;
          
          if (province.level2s) {
            const district = province.level2s.find(d => d.level2_id === addressData.district);
            if (district) {
              districtName = district.name;
              
              if (district.level3s) {
                const ward = district.level3s.find(w => w.level3_id === addressData.ward);
                if (ward) {
                  wardName = ward.name;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy tên địa chỉ:", err.message);
      }
    }
    
    // Ưu tiên sử dụng fullAddress nếu đã được cung cấp
    const fullAddress = addressData.fullAddress || 
      `${addressData.street}, ${wardName}, ${districtName}, ${provinceName}`;
    
    // Format the address with full names
    const formattedAddress = {
      ...addressData,
      cityName: provinceName,
      districtName: districtName,
      wardName: wardName,
      fullAddress: fullAddress
    };

    // Try to save to Supabase but catch potential errors with missing table
    try {
      // Check if addressForm table exists by querying it
      const { error: tableCheckError } = await supabase
        .from("addressForm")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        // If table doesn't exist, save to localStorage instead
        console.warn("Không thể sử dụng Supabase (bảng không tồn tại), lưu vào localStorage:", tableCheckError.message);
        
        // Get existing saved addresses
        const savedAddresses = JSON.parse(localStorage.getItem("savedAddresses") || "[]");
        
        // Add new address with unique local ID
        const newAddress = {
          ...formattedAddress,
          id: `local_${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        savedAddresses.push(newAddress);
        localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));
        
        return [newAddress]; // Return in same format as Supabase would
      } else {
        // If table exists, save to Supabase
        const { data, error } = await supabase
          .from("addressForm")
          .insert([formattedAddress])
          .select();

        if (error) {
          throw error;
        }

        return data;
      }
    } catch (dbError) {
      console.error("Lỗi khi thêm địa chỉ vào cơ sở dữ liệu:", dbError.message);
      
      // Fallback to localStorage if any DB error occurs
      try {
        const savedAddresses = JSON.parse(localStorage.getItem("savedAddresses") || "[]");
        const newAddress = {
          ...formattedAddress,
          id: `local_${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        savedAddresses.push(newAddress);
        localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));
        
        return [newAddress]; 
      } catch (localStorageError) {
        console.error("Lỗi khi lưu vào localStorage:", localStorageError);
        throw new Error("Không thể lưu địa chỉ vào bất kỳ hệ thống nào");
      }
    }
  } catch (error) {
    console.error("Lỗi khi xử lý địa chỉ:", error.message);
    throw error;
  }
}
