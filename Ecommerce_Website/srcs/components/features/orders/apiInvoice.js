/**
 * Service for generating and downloading PDF invoices using the Python FastAPI service
 */

// Base URL for the PDF generation API - hardcoded for now to avoid process.env error
// You can change this URL if your API is running on a different host/port
const INVOICE_API_BASE_URL = 'http://localhost:8002';

/**
 * Generate and download a PDF invoice from order data
 * 
 * @param {Object} orderData - Order data for the invoice
 * @returns {Promise<boolean>} - Success status
 */
export async function generateInvoice(orderData) {
  try {
    // Get products list or use single product as an array
    const products = Array.isArray(orderData.products) 
      ? orderData.products 
      : (orderData.product_info ? [orderData.product_info] : []);
    
    // Format the request data for the invoice API
    const requestData = {
      ten_khach: orderData.customer_name || "Khách hàng",
      dia_chi_khach: formatAddress(orderData.address) || "Không có địa chỉ",
      phone: orderData.phone || "",
      danh_sach_sp: products.map(p => formatProductForInvoice(p))
    };
    
    console.log('Sending invoice generation request:', requestData);
    
    // Call the FastAPI endpoint with extra headers for CORS
    const response = await fetch(`${INVOICE_API_BASE_URL}/generate-invoice/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'X-Requested-With': 'XMLHttpRequest'
      },
      mode: 'cors',
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Server error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error generating invoice: ${response.status} ${response.statusText}`);
    }
    
    // Get the PDF blob
    const blob = await response.blob();
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `hoa_don_${orderData.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error generating invoice:', error);
    return false;
  }
}

/**
 * Format the address object to a string
 * 
 * @param {Object} address - Address object
 * @returns {string} - Formatted address string
 */
function formatAddress(address) {
  if (!address) return 'Không có địa chỉ';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.ward) parts.push(address.ward);
  if (address.district) parts.push(address.district);
  if (address.city) parts.push(address.city);
  
  return parts.join(', ') || 'Không có địa chỉ';
}

/**
 * Format product info for invoice
 * 
 * @param {Object} product - Product information
 * @returns {Object} - Formatted product for invoice
 */
function formatProductForInvoice(product) {
  if (!product) {
    return {
      ten: "Sản phẩm không xác định",
      so_luong: 1,
      don_gia: 0,
      dvt: 'Khóa'
    };
  }
  
  // Get product title from various possible properties
  const ten = product.title || product.name || product.product_name || product.course_title || "Sản phẩm không xác định";
  
  // Get quantity from various possible properties
  const so_luong = product.quantity || product.qty || product.count || 1;
  
  // Parse price from string if needed
  let don_gia = 0;
  
  if (product.price !== undefined) {
    if (typeof product.price === 'number') {
      don_gia = product.price;
    } else if (typeof product.price === 'string') {
      // Remove any non-digit characters and parse as integer
      don_gia = parseInt(product.price.replace(/[^\d]/g, '')) || 0;
    }
  } else if (product.unit_price !== undefined) {
    don_gia = typeof product.unit_price === 'number' ? product.unit_price : 0;
  }
  
  return {
    ten,
    so_luong,
    don_gia,
    dvt: 'Khóa'
  };
} 