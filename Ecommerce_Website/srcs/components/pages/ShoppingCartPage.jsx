import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import CartHeader from '@/components/cart/CartHeader';
import CheckoutProgress from '@/components/cart/CheckoutProgress';
import EmptyCart from '@/components/cart/EmptyCart';
import CartItem from '@/components/cart/CartItem';
import { FiArrowRight, FiShoppingBag, FiMapPin, FiHome, FiTruck, FiCheckSquare, FiSquare, FiPlus, FiX } from 'react-icons/fi';
import { useCart } from '@/utils/CartContext';
import { useUser } from '@/components/features/user/UserContext';

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, removeFromCart, updateQuantity } = useCart();
  const { userInfo, getUserId } = useUser();
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [allSelected, setAllSelected] = useState(false);
  const [addressMode, setAddressMode] = useState('new'); // 'existing' or 'new'
  
  // New address form data
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    recipient: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
    type: 'home'
  });

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

  // Format address for display
  const formatAddressForDisplay = (address) => {
    if (!address) return 'Địa chỉ không hợp lệ';
    
    let parts = [];
    if (address.address) parts.push(address.address);
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ') || 'Chưa có địa chỉ chi tiết';
  };

  // Initialize selectedItems when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const initialSelectedState = cart.reduce((acc, item) => {
        acc[item.id] = true; // Default to selected
        return acc;
      }, {});
      setSelectedItems(initialSelectedState);
      setAllSelected(true);
    } else {
      setSelectedItems({});
      setAllSelected(false);
    }
  }, [cart]);

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newState = { ...prev, [itemId]: !prev[itemId] };
      // Check if all items are selected
      const areAllSelected = cart.every(item => newState[item.id]);
      setAllSelected(areAllSelected);
      return newState;
    });
  };

  // Toggle all items selection
  const toggleAllSelection = () => {
    const newAllSelected = !allSelected;
    setAllSelected(newAllSelected);
    
    const newSelectedItems = cart.reduce((acc, item) => {
      acc[item.id] = newAllSelected;
      return acc;
    }, {});
    
    setSelectedItems(newSelectedItems);
  };

  // Get selected cart items
  const getSelectedCartItems = () => {
    return cart.filter(item => selectedItems[item.id]);
  };

  // Format price for display
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
  };

  // Calculate cart totals based on selected items
  const calculateTotals = () => {
    const selectedCartItems = getSelectedCartItems();
    
    const subtotal = selectedCartItems.reduce((total, item) => {
      const price =
        typeof item.price === 'string'
          ? parseInt(item.price.replace(/[^\d]/g, ''))
          : item.price;
      return total + price * item.quantity;
    }, 0);

    // Apply shipping logic (free over 500,000₫)
    const shipping = subtotal >= 500000 ? 0 : 30000;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  };

  const { subtotal, shipping, total } = calculateTotals();

  // No saved-address backend — addresses always starts empty

  // Handle removing item from cart
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId, ({ removedProduct }) => {
      toast.success(
        `Đã xóa ${removedProduct.name || 'sản phẩm'} khỏi giỏ hàng`
      );
    });
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  // Format cart item for order page
  const prepareProductForOrder = (item) => {
    return {
      id: item.id,
      title: item.name,
      brand: item.brand,
      image: item.image,
      originalPrice: item.originalPrice
        ? formatPrice(item.originalPrice)
        : formatPrice(0),
      salePrice: formatPrice(item.price),
      quantity: item.quantity,
    };
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    
    // Automatically navigate to order page when address is selected
    const selectedCartItems = getSelectedCartItems();
    
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }
    
    // Calculate totals for order
    const orderSubtotal = selectedCartItems.reduce((total, item) => {
      const price = typeof item.price === 'string' 
        ? parseInt(item.price.replace(/[^\d]/g, '')) 
        : item.price;
      return total + price * item.quantity;
    }, 0);
    
    const shippingFee = orderSubtotal >= 500000 ? 0 : 30000;
    const discount = 0; // Can be updated if discount functionality is added
    const total = orderSubtotal + shippingFee - discount;
    
    // Create order object for ShippingInfo
    const orderInfo = {
      customerName: address.recipient || userInfo?.fullName,
      phone: address.phone || userInfo?.phone,
      fullAddress: formatAddressForDisplay(address),
      address: formatAddressForDisplay(address),
      productPrice: orderSubtotal,
      shippingFee: shippingFee,
      discount: discount,
      discountCode: '',
      total: total
    };
    
    // Prepare product info
    const singleProduct =
      selectedCartItems.length === 1
        ? prepareProductForOrder(selectedCartItems[0])
        : {
            id: 'multi-' + Date.now(),
            title: `Đơn hàng (${selectedCartItems.length} sản phẩm)`,
            brand: 'Nhiều thương hiệu',
            image: selectedCartItems[0].image,
            originalPrice: formatPrice(orderSubtotal + 50000),
            salePrice: formatPrice(total),
            quantity: 1,
          };

    // Navigate to order page with all necessary information
    navigate('/order', {
      state: {
        product: singleProduct,
        address: address,
        selectedItems: selectedCartItems,
        orderInfo: orderInfo
      },
    });

    // Show loading notification
    toast.success('Đang chuyển đến trang thanh toán...', {
      icon: '🛒',
      duration: 1500,
    });
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    navigate('/user/address');
  };

  // Handle change in new address form
  const handleNewAddressChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle change in address mode
  const handleAddressModeChange = (mode) => {
    setAddressMode(mode);
    if (mode === 'new') {
      // Pre-fill with user info if available
      setNewAddressForm(prev => ({
        ...prev,
        recipient: userInfo?.fullName || '',
        phone: userInfo?.phone || ''
      }));
    }
  };

  // Validate new address form
  const validateNewAddressForm = () => {
    const { name, recipient, phone, address, ward, district, city } = newAddressForm;
    
    if (!name) {
      toast.error('Vui lòng nhập tên địa chỉ');
      return false;
    }
    
    if (!recipient) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    
    if (!phone) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    
    if (!address) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }
    
    if (!ward) {
      toast.error('Vui lòng nhập phường/xã');
      return false;
    }
    
    if (!district) {
      toast.error('Vui lòng nhập quận/huyện');
      return false;
    }
    
    if (!city) {
      toast.error('Vui lòng nhập tỉnh/thành phố');
      return false;
    }
    
    return true;
  };

  // Handle checkout button click
  const handleCheckout = async () => {
    const selectedCartItems = getSelectedCartItems();
    
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    if (!userInfo) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      navigate('/home', { state: { modal: 'login' } });
      return;
    }
    
    // Handle different address modes
    if (addressMode === 'existing') {
      // Validate selected address
      if (!selectedAddress) {
        toast.error('Vui lòng chọn địa chỉ giao hàng!');
        return;
      }
      
      const singleProduct =
        selectedCartItems.length === 1
          ? prepareProductForOrder(selectedCartItems[0])
          : {
              id: 'multi-' + Date.now(),
              title: `Đơn hàng (${selectedCartItems.length} sản phẩm)`,
              brand: 'Nhiều thương hiệu',
              image: selectedCartItems[0].image,
              originalPrice: formatPrice(subtotal + 50000), // Add a markup for original price
              salePrice: formatPrice(total),
              quantity: 1,
            };

      navigate('/order', {
        state: {
          product: singleProduct,
          address: selectedAddress,
          selectedItems: selectedCartItems
        },
      });

      // Show success notification
      toast.success('Đang tiến hành đặt hàng...', {
        icon: '🛒',
        duration: 2000,
      });
      
      return;
    } else if (addressMode === 'new') {
      // Validate new address form
      if (!validateNewAddressForm()) {
        return;
      }
      
      // Use the new address for checkout
      const singleProduct =
        selectedCartItems.length === 1
          ? prepareProductForOrder(selectedCartItems[0])
          : {
              id: 'multi-' + Date.now(),
              title: `Đơn hàng (${selectedCartItems.length} sản phẩm)`,
              brand: 'Nhiều thương hiệu',
              image: selectedCartItems[0].image,
              originalPrice: formatPrice(subtotal + 50000),
              salePrice: formatPrice(total),
              quantity: 1,
            };

      // Navigate to order with the new address
      navigate('/order', {
        state: {
          product: singleProduct,
          address: newAddressForm,
          selectedItems: selectedCartItems,
          isNewAddress: true
        },
      });

      // Show success notification
      toast.success('Đang tiến hành đặt hàng...', {
        icon: '🛒',
        duration: 2000,
      });
      
      return;
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/home');
  };

  // Handle direct order for a single product
  const handleOrderNow = (itemId) => {
    if (!userInfo) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      navigate('/home', { state: { modal: 'login' } });
      return;
    }

    const item = cart.find((item) => item.id === itemId);
    if (!item) return;

    // Prepare the single product for order
    const product = prepareProductForOrder(item);
    
    // Navigate directly to order page with product data
    navigate('/order', {
      state: { product }
    });

    toast.success('Đang tiến hành đặt hàng...', {
      icon: '🛒',
      duration: 2000,
    });
  };

  // Handle proceed to buy
  const handleProceedToBuy = () => {
    const selectedCartItems = getSelectedCartItems();
    
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    if (!userInfo) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      navigate('/home', { state: { modal: 'login' } });
      return;
    }

    // Create single product for multiple items
    const singleProduct =
      selectedCartItems.length === 1
        ? prepareProductForOrder(selectedCartItems[0])
        : {
            id: 'multi-' + Date.now(),
            title: `Đơn hàng (${selectedCartItems.length} sản phẩm)`,
            brand: 'Nhiều thương hiệu',
            image: selectedCartItems[0].image,
            originalPrice: formatPrice(subtotal + 50000),
            salePrice: formatPrice(total),
            quantity: 1,
          };

    // Navigate directly to the order page
    navigate('/order', {
      state: {
        product: singleProduct,
        selectedItems: selectedCartItems
      },
    });

    toast.success('Đang tiến hành đặt hàng...', {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 py-8'
    >
      {/* Cart Section */}
      <section className='w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 space-y-6'>
        <CartHeader 
          count={cart.length} 
          selectedCount={getSelectedCartItems().length}
          onContinueShopping={handleContinueShopping} 
        />
        <CheckoutProgress currentStep={0} />

        {isLoading ? (
          <div className='py-20 flex flex-col items-center justify-center'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className='w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4'
            />
            <p className='text-gray-500'>Đang tải giỏ hàng...</p>
          </div>
        ) : cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Address Selection */}
            {showAddressSelection && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-8 bg-blue-50 p-5 rounded-xl border border-blue-100'
              >
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-lg font-semibold text-blue-800 flex items-center'>
                    <FiMapPin className='mr-2' /> Thông tin giao hàng
                  </h3>
                  <button
                    onClick={() => setShowAddressSelection(false)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Address Mode Selector */}
                <div className='flex border-b border-blue-200 mb-4'>
                  <button
                    onClick={() => handleAddressModeChange('existing')}
                    className={`py-2 px-4 font-medium ${
                      addressMode === 'existing'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                  >
                    Địa chỉ nhận hàng
                  </button>
                  <button
                    onClick={() => handleAddressModeChange('new')}
                    className={`py-2 px-4 font-medium ${
                      addressMode === 'new'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>

                {/* Existing Addresses */}
                {addressMode === 'existing' && (
                  <>
                    {loadingAddresses ? (
                      <div className='py-4 text-center text-gray-500'>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className='w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full inline-block mr-2'
                        />
                        Đang tải địa chỉ...
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className='py-4 text-center'>
                        <p className='text-gray-600 mb-3'>Bạn chưa có địa chỉ nào</p>
                        <div className='flex justify-center gap-3'>
                          <button
                            onClick={handleAddNewAddress}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                          >
                            Quản lý địa chỉ
                          </button>
                          <button
                            onClick={() => handleAddressModeChange('new')}
                            className='px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors'
                          >
                            Thêm địa chỉ mới
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedAddress?.id === address.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                            onClick={() => handleAddressSelect(address)}
                          >
                            <div className='flex items-start'>
                              <div className='w-6 h-6 mt-1 mr-3 flex-shrink-0'>
                                {selectedAddress?.id === address.id ? (
                                  <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                                    <div className='w-2 h-2 bg-white rounded-full'></div>
                                  </div>
                                ) : (
                                  <div className='w-5 h-5 border-2 border-gray-300 rounded-full'></div>
                                )}
                              </div>
                              <div className='flex-1 space-y-1'>
                                <div className='flex items-center'>
                                  <p className='font-semibold text-gray-800 text-lg'>
                                    {address.recipient}
                                  </p>
                                  {address.isDefault && (
                                    <span className='ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full'>
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className='text-gray-700 font-medium'>
                                  {address.phone}
                                </p>
                                <p className='text-gray-600'>
                                  {formatAddressForDisplay(address)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={handleAddNewAddress}
                          className='w-full py-3 mt-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center'
                        >
                          <FiPlus className='mr-2' /> Quản lý địa chỉ
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* New Address Form */}
                {addressMode === 'new' && (
                  <div className='bg-white p-4 rounded-lg border border-gray-100'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Name field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Tên địa chỉ</label>
                          <input
                            type="text"
                            name="name"
                            value={newAddressForm.name}
                            onChange={handleNewAddressChange}
                            placeholder="VD: Nhà, Công ty..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Type field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Loại địa chỉ</label>
                          <select
                            name="type"
                            value={newAddressForm.type}
                            onChange={handleNewAddressChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="home">Nhà riêng</option>
                            <option value="work">Công ty</option>
                          </select>
                        </div>
                        
                        {/* Recipient field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Người nhận</label>
                          <input
                            type="text"
                            name="recipient"
                            value={newAddressForm.recipient}
                            onChange={handleNewAddressChange}
                            placeholder="Tên người nhận"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Phone field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                          <input
                            type="tel"
                            name="phone"
                            value={newAddressForm.phone}
                            onChange={handleNewAddressChange}
                            placeholder="Số điện thoại"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      {/* Address field */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ</label>
                        <input
                          type="text"
                          name="address"
                          value={newAddressForm.address}
                          onChange={handleNewAddressChange}
                          placeholder="Số nhà, tên đường"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {/* City field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Tỉnh/Thành phố</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddressForm.city}
                            onChange={handleNewAddressChange}
                            placeholder="VD: Hồ Chí Minh"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* District field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Quận/Huyện</label>
                          <input
                            type="text"
                            name="district"
                            value={newAddressForm.district}
                            onChange={handleNewAddressChange}
                            placeholder="VD: Quận 1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Ward field */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Phường/Xã</label>
                          <input
                            type="text"
                            name="ward"
                            value={newAddressForm.ward}
                            onChange={handleNewAddressChange}
                            placeholder="VD: Phường Bến Nghé"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      {/* Default checkbox */}
                      <div className='flex items-center'>
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={newAddressForm.isDefault}
                          onChange={handleNewAddressChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>
                    </div>

                    <div className='mt-4 flex justify-end'>
                      <button
                        onClick={handleCheckout}
                        className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center'
                      >
                        <FiTruck className='mr-2' /> Giao đến địa chỉ này
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Select All Header */}
            <div className='flex items-center mb-4 pl-2'>
              <button 
                onClick={toggleAllSelection}
                className='p-1 focus:outline-none text-blue-600 hover:text-blue-800 transition-colors'
              >
                {allSelected ? (
                  <FiCheckSquare size={20} className="text-blue-600" />
                ) : (
                  <FiSquare size={20} className="text-gray-400" />
                )}
              </button>
              <span className='ml-2 text-gray-700 font-medium'>Chọn tất cả ({cart.length} sản phẩm)</span>
              
              <div className='ml-auto'>
                <span className='text-gray-500 text-sm'>
                  Đã chọn {getSelectedCartItems().length} sản phẩm
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className='space-y-2 mb-8'>
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <CartItem
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onQuickBuy={handleOrderNow}
                      isSelected={!!selectedItems[item.id]}
                      onToggleSelect={() => toggleItemSelection(item.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Summary */}
            <div className='mt-8 border-t pt-6'>
              <div className='bg-gray-50 rounded-xl p-6'>
                <div className='flex justify-between mb-4'>
                  <span className='text-gray-600'>Tạm tính ({getSelectedCartItems().length} sản phẩm):</span>
                  <span className='font-medium'>{formatPrice(subtotal)}</span>
                </div>

                <div className='flex justify-between mb-4'>
                  <span className='text-gray-600'>Phí vận chuyển:</span>
                  {shipping === 0 ? (
                    <span className='text-green-600 font-medium'>Miễn phí</span>
                  ) : (
                    <span className='font-medium'>{formatPrice(shipping)}</span>
                  )}
                </div>

                <div className='h-px bg-gray-200 my-4'></div>

                <div className='flex justify-between mb-6'>
                  <span className='text-lg font-bold'>Tổng cộng:</span>
                  <span className='text-xl font-bold text-red-600'>
                    {formatPrice(total)}
                  </span>
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <motion.button
                    whileHover={getSelectedCartItems().length > 0 ? { scale: 1.02 } : {}}
                    whileTap={getSelectedCartItems().length > 0 ? { scale: 0.98 } : {}}
                    onClick={handleProceedToBuy}
                    className={`flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md 
                      ${getSelectedCartItems().length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                      }`}
                    disabled={getSelectedCartItems().length === 0}
                  >
                    <span>{getSelectedCartItems().length === 0 ? 'Vui lòng chọn sản phẩm' : 'Mua hàng'}</span>
                    <FiArrowRight />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueShopping}
                    className='flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50'
                  >
                    <FiShoppingBag />
                    <span>Tiếp tục mua hàng</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
};

export default ShoppingCartPage;
