import  { useEffect, useState } from 'react'
import { MdBarChart, MdPieChart, MdTimeline, MdShowChart, MdDashboard, MdCategory, MdAnalytics, MdQueryStats } from 'react-icons/md'
import { 
  getProductCount, 
  getTotalRevenue, 
  getOrderCount, 
  getUserCount,
  getRevenueByMonth,
  getProfitByMonth,
  getTopProductPerformance,
  getRegionalDistribution,
  formatCurrencyValue
} from '@/components/features/products/apiProduct'

import { 
  RevenueAreaChart,
  TargetComparisonChart,
  ProductCategoryPieChart,
  BusinessMetricsRadarChart,
  PriceVsRatingScatterChart,
  SalesByProductTreemap,
  QuarterlyRevenueChart
} from '@/components/features/admin/dasboard/AdvancedCharts'

function PowerBIEmbed() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenueByMonth: [],
    profitByMonth: [],
    topProducts: [],
    regionalData: [],
    months: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
  })

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        const results = await Promise.allSettled([
          getProductCount(),
          getTotalRevenue(),
          getOrderCount(),
          getUserCount(),
          getRevenueByMonth(),
          getProfitByMonth(),
          getTopProductPerformance(),
          getRegionalDistribution()
        ]);
        
        const [
          productCountResult, 
          totalRevenueResult, 
          orderCountResult, 
          userCountResult,
          monthlyRevenueResult,
          monthlyProfitResult,
          productPerformanceResult,
          regionalDistributionResult
        ] = results;
        
        const productCount = productCountResult.status === 'fulfilled' ? productCountResult.value : 0;
        const totalRevenue = totalRevenueResult.status === 'fulfilled' ? totalRevenueResult.value : 0;
        const orderCount = orderCountResult.status === 'fulfilled' ? orderCountResult.value : 0;
        const userCount = userCountResult.status === 'fulfilled' ? userCountResult.value : 0;
        const monthlyRevenue = monthlyRevenueResult.status === 'fulfilled' ? monthlyRevenueResult.value : Array(12).fill(0);
        const monthlyProfit = monthlyProfitResult.status === 'fulfilled' ? monthlyProfitResult.value : Array(12).fill(0);
        const productPerformance = productPerformanceResult.status === 'fulfilled' ? productPerformanceResult.value : [];
        const regionalDistribution = regionalDistributionResult.status === 'fulfilled' ? regionalDistributionResult.value : [];

        setDashboardData({
          totalProducts: productCount,
          totalRevenue: totalRevenue,
          totalOrders: orderCount,
          totalUsers: userCount,
          revenueByMonth: monthlyRevenue,
          profitByMonth: monthlyProfit,
          topProducts: productPerformance,
          regionalData: regionalDistribution,
          months: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
        })
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const formatCurrency = (value) => {
    return formatCurrencyValue(value) + ' ₫'
  }

  const formatNumber = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const averageOrderValue = dashboardData.totalOrders > 0 
    ? Math.round(dashboardData.totalRevenue / dashboardData.totalOrders) 
    : 0

  const normalizeForBarChart = (data) => {
    if (!data || data.length === 0) return []
    
    const max = Math.max(...data)
    return data.map(value => Math.round((value / max) * 100))
  }

  const normalizedRevenueData = normalizeForBarChart(dashboardData.revenueByMonth)

  const renderTab = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardData.totalRevenue)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 font-medium">Tổng đơn hàng</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(dashboardData.totalOrders)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">Khách hàng</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(dashboardData.totalUsers)}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-700 font-medium">Giá trị trung bình</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(averageOrderValue)}</p>
              </div>
            </div>

            {/* Main charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sales Chart */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center">
                    <MdBarChart className="mr-2 text-blue-600" size={20} />
                    Doanh thu theo tháng
                  </h3>
                </div>
                <div className="h-64 flex items-end space-x-2">
                  {normalizedRevenueData.map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm" 
                        style={{ height: `${height}%` }}
                        title={`${dashboardData.months[index]}: ${formatCurrency(dashboardData.revenueByMonth[index])}`}
                      ></div>
                      <span className="text-xs mt-1 text-gray-600">{dashboardData.months[index]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profit Chart */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center">
                    <MdShowChart className="mr-2 text-green-600" size={20} />
                    Lợi nhuận theo tháng
                  </h3>
                </div>
                <div className="h-64 relative">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points={dashboardData.profitByMonth.map((value, index) => {
                        const normalizedValue = dashboardData.profitByMonth.length > 0 
                          ? 100 - (value / Math.max(...dashboardData.profitByMonth) * 100)
                          : 0
                        return `${index * (100 / (dashboardData.profitByMonth.length - 1))},${normalizedValue}`
                      }).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                    {dashboardData.months.map((month, index) => (
                      <span key={index} className="text-xs text-gray-600">{month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Performance */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center">
                    <MdTimeline className="mr-2 text-purple-600" size={20} />
                    Hiệu suất sản phẩm
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 py-2">Sản phẩm</th>
                        <th className="text-right text-xs font-medium text-gray-500 py-2">Doanh số</th>
                        <th className="text-right text-xs font-medium text-gray-500 py-2">Tăng trưởng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm font-medium text-gray-800">{product.name}</td>
                          <td className="py-2 text-sm text-right">{formatNumber(product.sales)}</td>
                          <td className={`py-2 text-sm text-right ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.growth >= 0 ? '+' : ''}{product.growth}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Regional Distribution */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center">
                    <MdPieChart className="mr-2 text-amber-600" size={20} />
                    Phân bố khu vực
                  </h3>
                </div>
                <div className="flex flex-col space-y-3">
                  {dashboardData.regionalData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.region}</span>
                        <span className="text-sm text-gray-500">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            index === 0 ? 'bg-blue-600' : 
                            index === 1 ? 'bg-green-600' : 
                            index === 2 ? 'bg-purple-600' : 
                            'bg-amber-600'
                          }`} 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
        
      case 'sales':
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Phân tích doanh thu</h2>
            <div className="grid grid-cols-1 gap-6">
              <QuarterlyRevenueChart 
                revenueData={dashboardData.revenueByMonth} 
                profitData={dashboardData.profitByMonth} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RevenueAreaChart 
                revenueData={dashboardData.revenueByMonth} 
                profitData={dashboardData.profitByMonth} 
              />
              <TargetComparisonChart 
                revenueData={dashboardData.revenueByMonth} 
                profitData={dashboardData.profitByMonth} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusinessMetricsRadarChart />
              <SalesByProductTreemap />
            </div>
          </div>
        );
        
      case 'products':
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Phân tích sản phẩm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductCategoryPieChart />
              <PriceVsRatingScatterChart />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-700 flex items-center">
                  <MdTimeline className="mr-2 text-purple-600" size={20} />
                  Chi tiết hiệu suất sản phẩm
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh số
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tăng trưởng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đánh giá
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {formatNumber(product.sales)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.growth >= 0 ? '+' : ''}{product.growth}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {4 + Math.random().toFixed(1)} / 5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {formatCurrency(product.sales * 850000)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'customers':
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Phân tích khách hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">Tổng khách hàng</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(dashboardData.totalUsers)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 font-medium">Khách hàng mới (tháng)</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(Math.round(dashboardData.totalUsers * 0.12))}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">Tỷ lệ quay lại</p>
                <p className="text-2xl font-bold mt-1">68.5%</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-700">Phân bố khách hàng theo khu vực</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex flex-col space-y-4">
                    {dashboardData.regionalData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">{item.region}</span>
                          <span className="text-sm text-gray-500">{Math.round(dashboardData.totalUsers * item.percentage / 100)} khách hàng</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              index === 0 ? 'bg-blue-600' : 
                              index === 1 ? 'bg-green-600' : 
                              index === 2 ? 'bg-purple-600' : 
                              'bg-amber-600'
                            }`} 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Phân tích độ tuổi</h4>
                  <div className="flex flex-col space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">18-24</span>
                        <span className="text-sm text-gray-500">21%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-blue-600" style={{ width: '21%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">25-34</span>
                        <span className="text-sm text-gray-500">42%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-green-600" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">35-44</span>
                        <span className="text-sm text-gray-500">28%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-purple-600" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">45+</span>
                        <span className="text-sm text-gray-500">9%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-amber-600" style={{ width: '9%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="h-full w-full bg-white rounded-lg overflow-hidden p-6">
      {/* Tab navigation */}
      <div className="flex overflow-x-auto mb-6 pb-2 border-b">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg mr-2 flex items-center ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <MdDashboard className="mr-2" />
          Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-t-lg mr-2 flex items-center ${activeTab === 'sales' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <MdAnalytics className="mr-2" />
          Phân tích doanh thu
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-lg mr-2 flex items-center ${activeTab === 'products' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <MdCategory className="mr-2" />
          Phân tích sản phẩm
        </button>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${activeTab === 'customers' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <MdQueryStats className="mr-2" />
          Phân tích khách hàng
        </button>
      </div>
      
      {/* Tab content */}
      {renderTab()}
    </div>
  )
}

export default PowerBIEmbed 