import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPlus, FaPencilAlt, FaTrash, FaHome, FaBriefcase } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '@/components/services/supabase';
import { useUser } from './UserContext';
import Spinner from '@/components/ui/Spinner';
import { fetchProvinces, fetchDistricts, fetchWards } from './apiAddress';
import { insertAddress, updateAddress, deleteAddress, setDefaultAddress } from './apiAddAddress';
import { toast } from 'react-hot-toast';

function UserAddress() {
  const { userInfo, getUserId } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    recipient: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
    type: 'home',
    provinceCode: '',
    districtCode: '',
    wardCode: ''
  });
  
  // Location data for dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Function to parse address_text JSON
  const parseAddressText = (addressText) => {
    try {
      return JSON.parse(addressText);
    } catch (e) {
      console.error('Error parsing address_text:', e);
      return {
        name: 'Địa chỉ',
        recipient: userInfo?.fullName || 'Người nhận',
        phone: userInfo?.phone || '',
        address: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false,
        type: 'home',
        provinceCode: '',
        districtCode: '',
        wardCode: ''
      };
    }
  };

  // Fetch addresses on component mount
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const userId = await getUserId();
        if (!userId) {
          console.error('User not logged in');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_address')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // If no addresses found, just set an empty array
        if (!data || data.length === 0) {
          setAddresses([]);
        } else {
          // Parse the address_text for each address
          const parsedAddresses = data.map(addr => {
            const addressData = parseAddressText(addr.address_text);
            return {
              id: addr.id,
              user_id: addr.user_id,
              created_at: addr.created_at,
              ...addressData
            };
          });
          
          setAddresses(parsedAddresses);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
    loadProvinces();
  }, [userInfo, getUserId]);
  
  // Load provinces on component mount
  const loadProvinces = async () => {
    setLoadingLocations(true);
    try {
      const provinceData = await fetchProvinces();
      setProvinces(provinceData);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingLocations(false);
    }
  };
  
  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.provinceCode) {
        setDistricts([]);
        return;
      }
      
      setLoadingLocations(true);
      try {
        const districtData = await fetchDistricts(formData.provinceCode);
        setDistricts(districtData);
        
        // Reset district and ward
        setFormData(prev => ({
          ...prev,
          districtCode: '',
          wardCode: '',
          district: '',
          ward: ''
        }));
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    
    loadDistricts();
  }, [formData.provinceCode]);
  
  // Load wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (!formData.districtCode) {
        setWards([]);
        return;
      }
      
      setLoadingLocations(true);
      try {
        const wardData = await fetchWards(formData.districtCode);
        setWards(wardData);
        
        // Reset ward
        setFormData(prev => ({
          ...prev,
          wardCode: '',
          ward: ''
        }));
      } catch (error) {
        console.error('Error loading wards:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    
    loadWards();
  }, [formData.districtCode]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.value === value);
      setFormData(prev => ({
        ...prev,
        provinceCode: value,
        city: selectedProvince ? selectedProvince.label : ''
      }));
    } else if (name === 'districtCode') {
      const selectedDistrict = districts.find(d => d.value === value);
      setFormData(prev => ({
        ...prev,
        districtCode: value,
        district: selectedDistrict ? selectedDistrict.label : ''
      }));
    } else if (name === 'wardCode') {
      const selectedWard = wards.find(w => w.value === value);
      setFormData(prev => ({
        ...prev,
        wardCode: value,
        ward: selectedWard ? selectedWard.label : ''
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('User not logged in');
        return;
      }
      
      const addressData = {
        ...formData,
        user_id: userId
      };
      
      if (editingId) {
        // Update existing address using the API
        console.log(`Updating address ID ${editingId}`);
        const data = await updateAddress(editingId, addressData);
        
        if (data && data.length > 0) {
          toast.success('Địa chỉ đã được cập nhật thành công!');
          
          // Refresh the address list
          const { data: refreshedAddresses, error } = await supabase
            .from('user_address')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error refreshing addresses:', error);
          } else {
            // Parse the address_text for each address
            const parsedAddresses = refreshedAddresses.map(addr => {
              const addressInfo = parseAddressText(addr.address_text);
              return {
                id: addr.id,
                user_id: addr.user_id,
                created_at: addr.created_at,
                ...addressInfo
              };
            });
            
            setAddresses(parsedAddresses);
          }
        } else {
          // Failed to update
          toast.error('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
        }
      } else {
        // Add new address using the API
        console.log('Adding new address');
        const data = await insertAddress(addressData);
        
        if (data && data.length > 0) {
          toast.success('Đã thêm địa chỉ mới thành công!');
          
          // Refresh the address list
          const { data: refreshedAddresses, error } = await supabase
            .from('user_address')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error refreshing addresses:', error);
          } else {
            // Parse the address_text for each address
            const parsedAddresses = refreshedAddresses.map(addr => {
              const addressInfo = parseAddressText(addr.address_text);
              return {
                id: addr.id,
                user_id: addr.user_id,
                created_at: addr.created_at,
                ...addressInfo
              };
            });
            
            setAddresses(parsedAddresses);
          }
        } else {
          // Failed to add
          toast.error('Không thể thêm địa chỉ. Vui lòng thử lại.');
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        recipient: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false,
        type: 'home',
        provinceCode: '',
        districtCode: '',
        wardCode: ''
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại sau.');
    }
  };

  const handleEdit = (address) => {
    // Find province, district, ward codes if they don't exist in the address
    let provinceCode = address.provinceCode;
    let districtCode = address.districtCode;
    let wardCode = address.wardCode;
    
    // If codes don't exist, try to find them
    if (!provinceCode) {
      const province = provinces.find(p => p.label === address.city);
      provinceCode = province ? province.value : '';
    }
    
    setFormData({ 
      ...address,
      provinceCode: provinceCode || '',
      districtCode: districtCode || '',
      wardCode: wardCode || ''
    });
    setEditingId(address.id);
    setShowAddForm(true);
    
    // Load districts for the selected province
    if (provinceCode) {
      fetchDistricts(provinceCode).then(data => {
        setDistricts(data);
        
        // If districtCode doesn't exist, try to find it
        if (!districtCode) {
          const district = data.find(d => d.label === address.district);
          if (district) {
            districtCode = district.value;
            setFormData(prev => ({
              ...prev,
              districtCode: districtCode
            }));
            
            // Load wards for the selected district
            fetchWards(districtCode).then(wardData => {
              setWards(wardData);
              
              // If wardCode doesn't exist, try to find it
              if (!wardCode) {
                const ward = wardData.find(w => w.label === address.ward);
                if (ward) {
                  wardCode = ward.value;
                  setFormData(prev => ({
                    ...prev,
                    wardCode: wardCode
                  }));
                }
              }
            });
          }
        }
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog before deleting
      if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
        return;
      }
      
      // Delete address using the API
      await deleteAddress(id);
      
      toast.success('Đã xóa địa chỉ thành công!');
      
      // Update state
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại sau.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('User not logged in');
        return;
      }
      
      // Set default address using the API
      const data = await setDefaultAddress(userId, id);
      
      // If we got data back, parse and update the addresses
      if (data && data.length > 0) {
        toast.success('Đã đặt địa chỉ mặc định thành công!');
        
        // We need to fetch all addresses again since multiple were updated
        const { data: refreshedAddresses, error } = await supabase
          .from('user_address')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error refreshing addresses:', error);
          // Fallback to simple state update
          setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
          })));
          return;
        }
        
        // Parse the address_text for each address
        const parsedAddresses = refreshedAddresses.map(addr => {
          const addressData = parseAddressText(addr.address_text);
          return {
            id: addr.id,
            user_id: addr.user_id,
            created_at: addr.created_at,
            ...addressData
          };
        });
        
        setAddresses(parsedAddresses);
      } else {
        // Fallback to simple state update
        toast.success('Đã đặt địa chỉ mặc định thành công!');
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Có lỗi xảy ra khi đặt địa chỉ mặc định. Vui lòng thử lại sau.');
    }
  };

  // Function to safely display an address as a formatted string
  const formatAddressForDisplay = (address) => {
    if (!address) return 'Địa chỉ không hợp lệ';
    
    let parts = [];
    if (address.address) parts.push(address.address);
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ') || 'Chưa có địa chỉ chi tiết';
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaMapMarkerAlt className="mr-3" /> Địa chỉ của tôi
        </h2>
        <p className="text-red-100 mt-1">Quản lý địa chỉ giao hàng của bạn</p>
      </div>

      <div className="p-8">
        {/* Address list */}
        <div className="space-y-5 mb-8">
          {addresses.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-50 rounded-full mx-auto flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-red-400 text-2xl" />
              </div>
              <p className="text-gray-500">Bạn chưa có địa chỉ nào</p>
            </div>
          ) : (
            addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                className={`border rounded-xl p-5 relative ${
                  address.isDefault 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                {address.isDefault && (
                  <span className="absolute top-5 right-5 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                    Mặc định
                  </span>
                )}
                
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    address.type === 'home' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {address.type === 'home' ? <FaHome className="text-lg" /> : <FaBriefcase className="text-lg" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{address.name}</h3>
                    <p className="text-sm text-gray-500">{address.recipient} | {address.phone}</p>
                  </div>
                </div>
                
                <div className="ml-1 text-gray-600">
                  <p>{formatAddressForDisplay(address)}</p>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  {!address.isDefault && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1.5 bg-white border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Đặt mặc định
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(address)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaPencilAlt />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(address.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add address button */}
        {!showAddForm ? (
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-full py-3 border-2 border-dashed border-red-300 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaPlus className="mr-2" /> Thêm địa chỉ mới
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-200 rounded-xl p-6 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên địa chỉ</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Nhà, Công ty..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Type field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại địa chỉ</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="home">Nhà riêng</option>
                    <option value="work">Công ty</option>
                  </select>
                </div>
                
                {/* Recipient field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận</label>
                  <input
                    type="text"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    placeholder="Tên người nhận"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Phone field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {/* Address field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Province field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                  <select
                    name="provinceCode"
                    value={formData.provinceCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={loadingLocations}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map(province => (
                      <option key={province.value} value={province.value}>
                        {province.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* District field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                  <select
                    name="districtCode"
                    value={formData.districtCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={!formData.provinceCode || loadingLocations}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(district => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Ward field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                  <select
                    name="wardCode"
                    value={formData.wardCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={!formData.districtCode || loadingLocations}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(ward => (
                      <option key={ward.value} value={ward.value}>
                        {ward.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Default checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
              
              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      recipient: '',
                      phone: '',
                      address: '',
                      ward: '',
                      district: '',
                      city: '',
                      isDefault: false,
                      type: 'home',
                      provinceCode: '',
                      districtCode: '',
                      wardCode: ''
                    });
                  }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-sm hover:shadow transition-all"
                >
                  {editingId ? 'Cập nhật' : 'Lưu'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default UserAddress;
