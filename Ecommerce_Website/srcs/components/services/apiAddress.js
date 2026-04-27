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
        const { data: provinceData } = await supabase
          .from("provinces")
          .select("name, full_name")
          .eq("code", addressData.city)
          .single();
        
        provinceName = provinceData?.full_name || provinceData?.name || addressData.city;
      } catch (err) {
        console.error("Lỗi khi lấy tên tỉnh/thành phố:", err.message);
      }
      
      try {
        const { data: districtData } = await supabase
          .from("districts")
          .select("name, full_name")
          .eq("code", addressData.district)
          .single();
        
        districtName = districtData?.full_name || districtData?.name || addressData.district;
      } catch (err) {
        console.error("Lỗi khi lấy tên quận/huyện:", err.message);
      }
      
      try {
        const { data: wardData } = await supabase
          .from("wards")
          .select("name, full_name")
          .eq("code", addressData.ward)
          .single();
        
        wardName = wardData?.full_name || wardData?.name || addressData.ward;
      } catch (err) {
        console.error("Lỗi khi lấy tên phường/xã:", err.message);
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
