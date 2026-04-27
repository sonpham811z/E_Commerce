import { supabase } from '@/components/services/supabase';

/**
 * Format address data into a text string
 * 
 * @param {Object} addressData - Address data
 * @returns {string} - Formatted address string
 */
function formatAddressToText(addressData) {
  // Create a JSON string with address details that we can parse later
  const addressInfo = {
    name: addressData.name || '',
    recipient: addressData.recipient || '',
    phone: addressData.phone || '',
    address: addressData.address || '',
    ward: addressData.ward || '',
    district: addressData.district || '',
    city: addressData.city || '',
    isDefault: addressData.isDefault || false,
    type: addressData.type || 'home',
    provinceCode: addressData.provinceCode || '',
    districtCode: addressData.districtCode || '',
    wardCode: addressData.wardCode || ''
  };
  
  return JSON.stringify(addressInfo);
}

/**
 * Insert address into user_address table
 * 
 * @param {Object} addressData - Address data to insert
 * @returns {Promise<Array>} - Return inserted address data
 */
export async function insertAddress(addressData) {
  try {
    console.log("Inserting address with data:", addressData);
    
    // Format address into a text string for the address_text field
    const addressText = formatAddressToText(addressData);
    
    // Create a simpler object with only the fields needed for the database
    const dbData = {
      user_id: addressData.user_id,
      address_text: addressText
    };
    
    console.log("Sending to database:", dbData);
    
    const { data, error } = await supabase
      .from('user_address')
      .insert(dbData)
      .select();

    if (error) {
      console.error('Error inserting address:', error);
      throw new Error(error.message || 'Không thể thêm địa chỉ');
    }

    return data || [];
  } catch (error) {
    console.error('Exception in insertAddress:', error);
    throw error;
  }
}

/**
 * Update address in user_address table
 * 
 * @param {string} id - Address ID
 * @param {Object} addressData - Address data to update
 * @returns {Promise<Array>} - Return updated address data
 */
export async function updateAddress(id, addressData) {
  try {
    console.log(`Updating address ID ${id} with data:`, addressData);
    
    const addressText = formatAddressToText(addressData);
    
    // Create a simpler object with only the fields needed for the database
    const dbData = {
      address_text: addressText
    };
    
    console.log("Sending to database:", dbData);
    
    const { data, error } = await supabase
      .from('user_address')
      .update(dbData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating address:', error);
      throw new Error(error.message || 'Không thể cập nhật địa chỉ');
    }

    return data || [];
  } catch (error) {
    console.error('Exception in updateAddress:', error);
    throw error;
  }
}

/**
 * Delete address from user_address table
 * 
 * @param {string} id - Address ID
 * @returns {Promise<boolean>} - Return true if successful
 */
export async function deleteAddress(id) {
  try {
    console.log(`Deleting address ID ${id}`);
    
    const { error } = await supabase
      .from('user_address')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      throw new Error(error.message || 'Không thể xóa địa chỉ');
    }

    return true;
  } catch (error) {
    console.error('Exception in deleteAddress:', error);
    throw error;
  }
}

/**
 * Since we're using a JSON string in address_text, we can't easily set isDefault at the database level.
 * Instead, we'll get all addresses for the user, update them accordingly, and save them back.
 * 
 * @param {string} userId - User ID
 * @param {string} addressId - Address ID to set as default
 * @returns {Promise<Array>} - Return updated address data
 */
export async function setDefaultAddress(userId, addressId) {
  try {
    console.log(`Setting address ID ${addressId} as default for user ${userId}`);
    
    // First, get all addresses for the user
    const { data: addresses, error: fetchError } = await supabase
      .from('user_address')
      .select('*')
      .eq('user_id', userId);
      
    if (fetchError) {
      console.error('Error fetching addresses:', fetchError);
      throw new Error(fetchError.message || 'Không thể đặt địa chỉ mặc định');
    }
    
    // Process each address
    for (const address of addresses) {
      // Parse the address_text to get the data
      let addressData = {};
      try {
        addressData = JSON.parse(address.address_text);
      } catch (e) {
        console.error('Error parsing address_text:', e);
        continue;
      }
      
      // Update isDefault flag
      addressData.isDefault = address.id === addressId;
      
      // Save back to database
      const { error: updateError } = await supabase
        .from('user_address')
        .update({ address_text: JSON.stringify(addressData) })
        .eq('id', address.id);
        
      if (updateError) {
        console.error(`Error updating address ${address.id}:`, updateError);
      }
    }
    
    // Get the updated default address
    const { data, error } = await supabase
    .from('user_address')
    .select('*')
      .eq('id', addressId)
      .single();

  if (error) {
      console.error('Error getting updated default address:', error);
      throw new Error(error.message || 'Không thể đặt địa chỉ mặc định');
  }

    return [data];
  } catch (error) {
    console.error('Exception in setDefaultAddress:', error);
    throw error;
  }
}
