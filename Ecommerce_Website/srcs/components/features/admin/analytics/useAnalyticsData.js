import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  getOrderCount,
  getOrderStatsByStatus,
  getProfitByMonth,
  getRegionalDistribution,
  getRevenueByMonth,
  getRevenueByRecentDays,
  getTotalRevenue,
} from './apiAnalytics';
import { getTopProductPerformance, getUserCount } from '../../../services/apiDashboard';

export const useAnalyticsData = (selectedYear) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentDaysData, setRecentDaysData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    revenue: '0',
    orders: 0,
    newCustomers: 0,
    profit: '0',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const year = parseInt(selectedYear);

        const [monthlyRevenue, monthlyProfit] = await Promise.all([
          getRevenueByMonth(year),
          getProfitByMonth(year),
        ]);

        const formattedSalesData = monthlyRevenue.map((revenue, index) => {
          const profit = monthlyProfit[index] || Math.round(revenue * 0.35);
          const orders = revenue > 0 ? Math.round(revenue / 2500000) : 0;
          return {
            name: `T${index + 1}`,
            revenue: Math.round(revenue / 1000000),
            profit: Math.round(profit / 1000000),
            orders,
          };
        });
        setSalesData(formattedSalesData);

        const [
          topProductsData,
          totalRevenue,
          totalOrders,
          userCount,
          statusData,
          recentData,
          regionData,
        ] = await Promise.all([
          getTopProductPerformance(5),
          getTotalRevenue(),
          getOrderCount(),
          getUserCount(),
          getOrderStatsByStatus(),
          getRevenueByRecentDays(7),
          getRegionalDistribution(),
        ]);

        setTopProducts(topProductsData);

        // Build category breakdown from top products
        const categorySales = {};
        topProductsData.forEach((product) => {
          const category = product.category || 'Khác';
          categorySales[category] = (categorySales[category] || 0) + (product.sales || 0);
        });
        setCategoryData(
          Object.entries(categorySales).map(([name, value]) => ({ name, value }))
        );

        setSummaryMetrics({
          revenue: `₫${Math.round(totalRevenue / 1000000).toLocaleString()}M`,
          orders: totalOrders,
          newCustomers: userCount,
          profit: `₫${Math.round((totalRevenue * 0.35) / 1000000).toLocaleString()}M`,
        });

        setOrderStatusData(statusData);
        setRecentDaysData(recentData);
        setRegionalData(regionData);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.');
        toast.error('Lỗi kết nối dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return {
    salesData,
    categoryData,
    orderStatusData,
    recentDaysData,
    topProducts,
    regionalData,
    summaryMetrics,
    isLoading,
    error,
  };
};
