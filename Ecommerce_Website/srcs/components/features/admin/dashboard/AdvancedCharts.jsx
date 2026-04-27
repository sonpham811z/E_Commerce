import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Sector,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  ComposedChart,
} from 'recharts';

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 ₫';

  const formattedValue = String(Math.round(value)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.'
  );

  return `${formattedValue} ₫`;
};

const formatNumber = (value) => {
  if (!value && value !== 0) return '0';

  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
];

const REVENUE_COLORS = {
  revenue: {
    start: '#4158D0',
    end: '#C850C0',
  },
  profit: {
    start: '#00DDFF',
    end: '#0099FF',
  },
  target: {
    base: '#FF9A8B',
    highlight: '#FF6A88',
  },
};

const transformMonthlyData = (revenueData, profitData) => {
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return months.map((month, index) => ({
    name: month,
    doanhThu: revenueData[index] || 0,
    loiNhuan: profitData[index] || 0,
    target: (revenueData[index] || 0) * 1.2,
  }));
};

const transformQuarterlyData = (revenueData, profitData) => {
  const quarters = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
  const quarterlyRevenue = [];
  const quarterlyProfit = [];

  for (let i = 0; i < 4; i++) {
    const startMonth = i * 3;
    let quarterRevenue = 0;
    let quarterProfit = 0;

    for (let j = 0; j < 3; j++) {
      quarterRevenue += revenueData[startMonth + j] || 0;
      quarterProfit += profitData[startMonth + j] || 0;
    }

    quarterlyRevenue.push(quarterRevenue);
    quarterlyProfit.push(quarterProfit);
  }

  return quarters.map((quarter, index) => ({
    name: quarter,
    doanhThu: quarterlyRevenue[index],
    loiNhuan: quarterlyProfit[index],
    target: quarterlyRevenue[index] * 1.2,
    namTruoc: quarterlyRevenue[index] * 0.85,
  }));
};

export const RevenueAreaChart = ({ revenueData, profitData }) => {
  const data = transformMonthlyData(revenueData, profitData);

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Doanh thu & Lợi nhuận trong năm
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='5%'
                stopColor={REVENUE_COLORS.revenue.start}
                stopOpacity={0.8}
              />
              <stop
                offset='95%'
                stopColor={REVENUE_COLORS.revenue.end}
                stopOpacity={0.2}
              />
            </linearGradient>
            <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='5%'
                stopColor={REVENUE_COLORS.profit.start}
                stopOpacity={0.8}
              />
              <stop
                offset='95%'
                stopColor={REVENUE_COLORS.profit.end}
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey='name' tick={{ fontSize: 10 }} />
          <YAxis
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(0)}tr`
                : `${(value / 1000).toFixed(0)}k`
            }
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Area
            type='monotone'
            dataKey='doanhThu'
            name='Doanh thu'
            stroke={REVENUE_COLORS.revenue.start}
            fillOpacity={1}
            fill='url(#colorRevenue)'
            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
          />
          <Area
            type='monotone'
            dataKey='loiNhuan'
            name='Lợi nhuận'
            stroke={REVENUE_COLORS.profit.start}
            fillOpacity={1}
            fill='url(#colorProfit)'
            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TargetComparisonChart = ({ revenueData, profitData }) => {
  const data = transformMonthlyData(revenueData, profitData);

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        So sánh doanh thu với mục tiêu
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' tick={{ fontSize: 10 }} />
          <YAxis
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(0)}tr`
                : `${(value / 1000).toFixed(0)}k`
            }
          />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <defs>
            <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0%'
                stopColor={REVENUE_COLORS.revenue.start}
                stopOpacity={0.8}
              />
              <stop
                offset='100%'
                stopColor={REVENUE_COLORS.revenue.end}
                stopOpacity={0.8}
              />
            </linearGradient>
          </defs>
          <Bar
            dataKey='doanhThu'
            name='Doanh thu'
            barSize={20}
            fill='url(#barGradient)'
            radius={[4, 4, 0, 0]}
          />
          <Line
            type='monotone'
            dataKey='target'
            name='Mục tiêu'
            stroke={REVENUE_COLORS.target.base}
            strokeWidth={2}
            dot={{ fill: REVENUE_COLORS.target.highlight, r: 4 }}
            activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const QuarterlyRevenueChart = ({ revenueData, profitData }) => {
  const data = transformQuarterlyData(revenueData, profitData);

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Phân tích doanh thu theo quý
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(0)}tr`
                : `${(value / 1000).toFixed(0)}k`
            }
          />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <defs>
            <linearGradient id='colorCurrentYear' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#8E2DE2' stopOpacity={0.8} />
              <stop offset='100%' stopColor='#4A00E0' stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id='colorLastYear' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#c2c2c2' stopOpacity={0.8} />
              <stop offset='100%' stopColor='#8a8a8a' stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Bar
            dataKey='doanhThu'
            name='Năm nay'
            fill='url(#colorCurrentYear)'
            radius={[6, 6, 0, 0]}
            barSize={30}
          />
          <Bar
            dataKey='namTruoc'
            name='Năm trước'
            fill='url(#colorLastYear)'
            radius={[6, 6, 0, 0]}
            barSize={30}
          />
          <Line
            type='monotone'
            dataKey='loiNhuan'
            name='Lợi nhuận'
            stroke='#00b5ad'
            strokeWidth={2}
            dot={{ fill: '#00b5ad', r: 4 }}
          />
          <Line
            type='monotone'
            dataKey='target'
            name='Mục tiêu'
            stroke='#ff7675'
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={{ fill: '#ff7675', r: 4 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProductCategoryPieChart = () => {
  // Dữ liệu mẫu cho danh mục sản phẩm
  const data = [
    { name: 'Laptop', value: 42 },
    { name: 'Phụ kiện', value: 28 },
    { name: 'Linh kiện', value: 18 },
    { name: 'PC Gaming', value: 12 },
  ];

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor='middle' fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill='none'
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none' />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill='#333'
        >{`${value}%`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill='#999'
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // State cho active sector
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Danh mục sản phẩm bán chạy
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={80}
            fill='#8884d8'
            dataKey='value'
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Biểu đồ Radar phân tích các chỉ số kinh doanh theo mục tiêu
export const BusinessMetricsRadarChart = () => {
  const data = [
    { subject: 'Doanh thu', A: 85, fullMark: 100 },
    { subject: 'Lợi nhuận', A: 76, fullMark: 100 },
    { subject: 'Khách hàng mới', A: 92, fullMark: 100 },
    { subject: 'Đơn hàng', A: 80, fullMark: 100 },
    { subject: 'Giá trị TB', A: 65, fullMark: 100 },
    { subject: 'Tỷ lệ chuyển đổi', A: 78, fullMark: 100 },
  ];

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Chỉ số kinh doanh (% so với mục tiêu)
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <RadarChart
          cx='50%'
          cy='50%'
          outerRadius='75%'
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey='subject' />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name='Hiệu suất'
            dataKey='A'
            stroke='#8884d8'
            fill='#8884d8'
            fillOpacity={0.6}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Tooltip formatter={(value) => `${value}%`} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Biểu đồ phân tán (Scatter) cho phân tích mối quan hệ giữa giá và đánh giá sản phẩm
export const PriceVsRatingScatterChart = () => {
  // Dữ liệu mẫu
  const sampleData = [
    {
      price: 12000000,
      rating: 4.8,
      sales: 250,
      name: 'Laptop Gaming ASUS TUF',
    },
    { price: 22000000, rating: 4.9, sales: 180, name: 'Laptop Dell XPS' },
    { price: 8500000, rating: 4.2, sales: 320, name: 'Laptop Acer Aspire' },
    { price: 19000000, rating: 4.7, sales: 230, name: 'Laptop MSI Gaming' },
    { price: 15000000, rating: 4.5, sales: 270, name: 'Laptop HP Envy' },
    { price: 25000000, rating: 4.8, sales: 150, name: 'Laptop Apple MacBook' },
    { price: 10500000, rating: 4.3, sales: 290, name: 'Laptop Lenovo IdeaPad' },
    {
      price: 17500000,
      rating: 4.6,
      sales: 210,
      name: 'Laptop Gaming Predator',
    },
    { price: 1200000, rating: 4.0, sales: 350, name: 'Bàn phím cơ AKKO' },
    { price: 2500000, rating: 4.7, sales: 200, name: 'Chuột Gaming Logitech' },
    { price: 3200000, rating: 4.4, sales: 180, name: 'Tai nghe Gaming Razer' },
    { price: 1800000, rating: 4.2, sales: 220, name: 'SSD Samsung 1TB' },
    { price: 600000, rating: 3.9, sales: 400, name: 'Bàn di chuột Gaming' },
  ];

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Phân tích giá và đánh giá sản phẩm
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <ScatterChart margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
          <CartesianGrid />
          <XAxis
            type='number'
            dataKey='price'
            name='Giá'
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
            label={{
              value: 'Giá (triệu VNĐ)',
              position: 'insideBottomRight',
              offset: 0,
            }}
          />
          <YAxis
            type='number'
            dataKey='rating'
            name='Đánh giá'
            domain={[3.5, 5]}
            label={{
              value: 'Đánh giá (sao)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => [
              name === 'Giá' ? formatCurrency(value) : value,
              name,
            ]}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className='bg-white p-2 border border-gray-200 shadow-sm rounded'>
                    <p className='font-medium text-sm'>{data.name}</p>
                    <p className='text-xs'>Giá: {formatCurrency(data.price)}</p>
                    <p className='text-xs'>Đánh giá: {data.rating} sao</p>
                    <p className='text-xs'>
                      Đã bán: {formatNumber(data.sales)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            name='Sản phẩm'
            data={sampleData}
            fill='#8884d8'
            shape='circle'
          >
            {sampleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.7}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SalesByProductTreemap = () => {
  const data = [
    {
      name: 'Laptop',
      size: 4750,
      children: [
        { name: 'Gaming', size: 1800 },
        { name: 'Văn phòng', size: 1200 },
        { name: 'Đồ họa', size: 900 },
        { name: 'Mỏng nhẹ', size: 850 },
      ],
    },
    {
      name: 'PC',
      size: 2350,
      children: [
        { name: 'Gaming', size: 950 },
        { name: 'Văn phòng', size: 650 },
        { name: 'Đồ họa', size: 750 },
      ],
    },
    {
      name: 'Linh kiện',
      size: 2820,
      children: [
        { name: 'CPU', size: 550 },
        { name: 'RAM', size: 420 },
        { name: 'SSD', size: 680 },
        { name: 'VGA', size: 780 },
        { name: 'Mainboard', size: 390 },
      ],
    },
    {
      name: 'Phụ kiện',
      size: 2590,
      children: [
        { name: 'Chuột', size: 720 },
        { name: 'Bàn phím', size: 680 },
        { name: 'Tai nghe', size: 580 },
        { name: 'Balo', size: 320 },
        { name: 'Khác', size: 290 },
      ],
    },
  ];

  return (
    <div className='h-80 w-full p-4'>
      <h3 className='text-base font-semibold text-gray-700 mb-4'>
        Cơ cấu doanh số theo nhóm sản phẩm
      </h3>
      <ResponsiveContainer width='100%' height='100%'>
        <Treemap
          data={data}
          dataKey='size'
          ratio={4 / 3}
          stroke='#fff'
          fill='#8884d8'
          padding={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <Tooltip
            formatter={(value) => formatNumber(value)}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className='bg-white p-2 border border-gray-200 shadow-sm rounded'>
                    <p className='font-medium text-sm'>{data.name}</p>
                    <p className='text-xs'>
                      Doanh số: {formatNumber(data.size || 0)} sản phẩm
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};
