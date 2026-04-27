import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useAnalyticsData } from '../../features/admin/analytics/useAnalyticsData';
import { exportReportAsImage } from '../../../utils/exportReport';
import AnalyticsCard from '../../features/admin/analytics/AnalyticsCard';
import ChartRevenueProfit from '../../features/admin/analytics/ChartRevenueProfit';
import ChartOrderTrend from '../../features/admin/analytics/ChartOrderTrend';
import ChartCategorySales from '../../features/admin/analytics/ChartCategorySales';
import ChartRevenueGrowth from '../../features/admin/analytics/ChartRevenueGrowth';
import ChartOrderStatus from '../../features/admin/analytics/ChartOrderStatus';
import ChartRecentDays from '../../features/admin/analytics/ChartRecentDays';
import ChartTopProducts from '../../features/admin/analytics/ChartTopProducts';
import ChartRegionalDistribution from '../../features/admin/analytics/ChartRegionalDistribution';
import AnimatedDiv from '../../ui/AnimatedDiv';
import AnimatedButton from '../../ui/AnimatedButton';

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2];
};

const Analytics = () => {
  const [selectedYear, setSelectedYear] = useState('2023');
  const {
    salesData,
    categoryData,
    orderStatusData,
    recentDaysData,
    topProducts,
    regionalData,
    summaryMetrics,
    isLoading,
    error,
  } = useAnalyticsData(selectedYear);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Spinner size='lg' />
      </div>
    );
  }

  const handleExportReport = () => {
    exportReportAsImage(
      'analytics-report',
      `bao_cao_phan_tich_${selectedYear}.png`
    );
  };

  return (
    <AnimatedDiv id='analytics-report' className='space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <AnimatedDiv>
          <h1 className='text-3xl font-bold text-gray-800 font-sans tracking-tight'>
            Phân tích bán hàng
          </h1>
          <p className='text-gray-500 mt-1 font-medium leading-relaxed'>
            Theo dõi hiệu suất kinh doanh và hành vi khách hàng
          </p>
        </AnimatedDiv>
        <AnimatedDiv className='flex flex-wrap gap-3'>
          <select
            className='px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>{`Năm ${year}`}</option>
            ))}
          </select>
          <AnimatedButton
            className='px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md text-sm hover:from-red-700 hover:to-red-600 transition font-medium shadow-md'
            onClick={handleExportReport}
          >
            Xuất báo cáo
          </AnimatedButton>
        </AnimatedDiv>
      </div>

      {error && (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-yellow-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                {error}{' '}
                <button
                  onClick={() => window.location.reload()}
                  className='font-medium underline'
                >
                  Tải lại trang
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <AnimatedDiv className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <AnalyticsCard
          title='Doanh thu'
          value={summaryMetrics.revenue}
          icon={
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          }
          change='12.5% so với tháng trước'
          changeType='increase'
        />
        <AnalyticsCard
          title='Đơn hàng'
          value={summaryMetrics.orders.toString()}
          icon={
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
            />
          }
          change='8.2% so với tháng trước'
          changeType='increase'
        />
        <AnalyticsCard
          title='Khách hàng mới'
          value={summaryMetrics.newCustomers.toString()}
          icon={
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
            />
          }
          change='3.1% so với tháng trước'
          changeType='decrease'
        />
        <AnalyticsCard
          title='Lợi nhuận'
          value={summaryMetrics.profit}
          icon={
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          }
          change='14.3% so với tháng trước'
          changeType='increase'
        />
      </AnimatedDiv>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartRevenueProfit data={salesData} />
        <ChartOrderTrend data={salesData} />
        <ChartCategorySales data={categoryData} />
        <ChartRevenueGrowth data={salesData} />
      </div>

      <ChartOrderStatus data={orderStatusData} />
      <ChartRecentDays data={recentDaysData} />
      <ChartTopProducts data={topProducts} />
      <ChartRegionalDistribution data={regionalData} />
    </AnimatedDiv>
  );
};

export default Analytics;
