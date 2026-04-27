import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiMessageSquare, FiUser, FiCalendar, FiStar, FiTrash2, FiMail, FiTag, FiRefreshCw } from 'react-icons/fi';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { supabase } from '@/components/services/supabase';

// Function to fetch feedback data from Supabase
const fetchFeedbackData = async (status, type, rating) => {
  try {
    let query = supabase.from('customer_feedback').select('*');

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    if (rating !== 'all') {
      query = query.eq('rating', parseInt(rating));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Normalize column names to match UI expectations
    return (data || []).map((row) => ({
      ...row,
      customer: row.customer || row.full_name || 'Khách hàng',
      date:     row.date     || row.created_at,
      product:  row.product  || row.subject   || '',
      status:   row.status   || 'Chưa phản hồi',
      type:     row.type     || 'Góp ý',
      rating:   row.rating   || 0,
      reply:    row.reply    || '',
    }));
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    throw error;
  }
};

// Function to reply to a feedback
const replyToFeedback = async (feedbackId, replyMessage) => {
  try {
    const { data, error } = await supabase
      .from('customer_feedback')
      .update({ reply: replyMessage, status: 'Đã phản hồi' })
      .eq('id', feedbackId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error replying to feedback:', error.message);
    throw error;
  }
};

// Function to delete feedback
const deleteFeedbackItem = async (feedbackId) => {
  try {
    const { error } = await supabase
      .from('customer_feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    throw error;
  }
};

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feedback data from Supabase
  useEffect(() => {
    const loadFeedbacks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchFeedbackData(filterStatus, filterType, filterRating);
        setFeedbacks(data);
      } catch (error) {
        console.error('Error fetching feedback data:', error.message);
        setError('Không thể tải dữ liệu phản hồi. Vui lòng thử lại sau.');
        toast.error('Lỗi kết nối dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeedbacks();
  }, [filterStatus, filterType, filterRating]);

  // Filter feedbacks based on search term
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchSearch = 
      (feedback.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (feedback.message?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (feedback.product?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchSearch;
  });

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyMessage(''); // Reset reply message when selecting a new feedback
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedFeedback) return;
    
    try {
      // Send reply to Supabase
      await replyToFeedback(selectedFeedback.id, replyMessage);
      
      // Update local state
      const updatedFeedbacks = feedbacks.map(f => 
        f.id === selectedFeedback.id ? { ...f, status: 'Đã phản hồi', reply: replyMessage } : f
      );
      
      setFeedbacks(updatedFeedbacks);
      setSelectedFeedback({ ...selectedFeedback, status: 'Đã phản hồi', reply: replyMessage });
      setReplyMessage('');
      toast.success(`Đã gửi phản hồi đến ${selectedFeedback.customer}`);
    } catch (error) {
      console.error('Error updating feedback:', error.message);
      toast.error('Không thể cập nhật phản hồi. Vui lòng thử lại sau.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      try {
        // Delete from Supabase
        await deleteFeedbackItem(id);
        
        // Update local state
        const updatedFeedbacks = feedbacks.filter(f => f.id !== id);
        setFeedbacks(updatedFeedbacks);
        
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback(null);
        }
        
        toast.success('Đã xóa phản hồi');
      } catch (error) {
        console.error('Error deleting feedback:', error.message);
        toast.error('Không thể xóa phản hồi. Vui lòng thử lại sau.');
      }
    }
  };

  // Generate star rating display
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FiStar 
        key={index} 
        className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  // Refresh data function
  const handleRefresh = () => {
    setIsLoading(true);
    setFilterStatus('all');
    setFilterType('all');
    setFilterRating('all');
    setSearchTerm('');
    
    setTimeout(() => {
      const loadFeedbacks = async () => {
        try {
          const data = await fetchFeedbackData('all', 'all', 'all');
          setFeedbacks(data);
        } catch (error) {
          setError('Không thể tải dữ liệu phản hồi. Vui lòng thử lại sau.');
          toast.error('Lỗi kết nối dữ liệu!');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadFeedbacks();
    }, 500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phản hồi khách hàng</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Làm mới
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition flex items-center">
            <FiFilter className="mr-2" />
            Lọc phản hồi
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiRefreshCw className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} <button onClick={handleRefresh} className="font-medium underline">Tải lại trang</button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Filters and Feedback List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm phản hồi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Chưa phản hồi">Chưa phản hồi</option>
                  <option value="Đã phản hồi">Đã phản hồi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Loại</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Đánh giá sản phẩm">Đánh giá sản phẩm</option>
                  <option value="Đánh giá dịch vụ">Đánh giá dịch vụ</option>
                  <option value="Khiếu nại">Khiếu nại</option>
                  <option value="Góp ý">Góp ý</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredFeedbacks.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không tìm thấy phản hồi phù hợp
              </div>
            ) : (
              filteredFeedbacks.map(feedback => (
                <div 
                  key={feedback.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedFeedback?.id === feedback.id ? 'bg-red-50' : ''}`}
                  onClick={() => handleSelectFeedback(feedback)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800 truncate">{feedback.customer}</div>
                    <div className="flex">{renderStars(feedback.rating)}</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2 truncate">{feedback.product}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 mb-2">{feedback.message}</div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-500">{new Date(feedback.date).toLocaleDateString('vi-VN')}</div>
                    <div 
                      className={`px-2 py-1 rounded-full text-white ${
                        feedback.status === 'Chưa phản hồi' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    >
                      {feedback.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {selectedFeedback ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">{selectedFeedback.customer}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiMail className="mr-1" />
                        {selectedFeedback.email}
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        {new Date(selectedFeedback.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiTag className="mr-1 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedFeedback.product}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Đánh giá:</span>
                    <div className="flex">{renderStars(selectedFeedback.rating)}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${
                    selectedFeedback.type === 'Khiếu nại' 
                      ? 'bg-red-500' 
                      : selectedFeedback.type === 'Góp ý' 
                        ? 'bg-blue-500' 
                        : 'bg-green-500'
                  }`}>
                    {selectedFeedback.type}
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600 rounded-l-lg"></div>
                  <div className="pl-3">
                    <div className="flex items-start mb-2">
                      <FiMessageSquare className="mt-1 mr-2 text-red-600" />
                      <h3 className="font-medium text-gray-800">Nội dung phản hồi</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{selectedFeedback.message}</p>
                  </div>
                </div>
                
                {selectedFeedback.reply && (
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-lg"></div>
                    <div className="pl-3">
                      <div className="flex items-start mb-2">
                        <FiMessageSquare className="mt-1 mr-2 text-green-600" />
                        <h3 className="font-medium text-gray-800">Phản hồi của bạn</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{selectedFeedback.reply}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleReplySubmit} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phản hồi
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Nhập nội dung phản hồi..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      disabled={!replyMessage.trim()}
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
              <FiMessageSquare className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Chưa chọn phản hồi</h3>
              <p className="text-center">Vui lòng chọn một phản hồi từ danh sách bên trái để xem chi tiết.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerFeedback; 