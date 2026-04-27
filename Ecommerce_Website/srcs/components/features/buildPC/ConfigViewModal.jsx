import { FiX, FiDownload } from 'react-icons/fi';

const COMPONENTS_MAP = {
  cpu: 'CPU',
  ssd: 'Ổ cứng SSD',
  mouse: 'Chuột máy tính',
  keyboard: 'Bàn phím',
  headset: 'Tai nghe',
  'linh kiện': 'Tản nhiệt CPU',
  screen: 'Màn hình',
  case: 'Case máy tính',
  ram: 'RAM',
};

function ConfigViewModal({ isOpen, onClose, selectedParts, total }) {
  if (!isOpen) return null;

  const selectedComponents = Object.entries(selectedParts)
    .filter(([, part]) => part !== null)
    .map(([key, part]) => ({
      category: COMPONENTS_MAP[key] || key,
      name: part.title,
      price: Number(part.salePrice),
      image: part.image,
    }));

  const handleExportPDF = async () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cấu Hình Build PC</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
            .header h1 { color: #dc2626; margin: 0; }
            .component { display: flex; padding: 15px; border-bottom: 1px solid #e5e7eb; align-items: center; }
            .component img { width: 60px; height: 60px; margin-right: 15px; object-fit: contain; background: #f9fafb; padding: 5px; border-radius: 8px; }
            .component-info { flex: 1; }
            .component-name { font-weight: bold; margin-bottom: 5px; color: #374151; }
            .component-category { color: #6b7280; font-size: 14px; font-weight: 600; }
            .component-price { font-weight: bold; color: #dc2626; font-size: 16px; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dc2626; color: #dc2626; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .date { color: #6b7280; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CẤU HÌNH BUILD PC</h1>
            <p class="date">Ngày tạo: ${new Date().toLocaleDateString(
              'vi-VN'
            )}</p>
          </div>
          
          <div class="components">
            ${selectedComponents
              .map(
                (component) => `
              <div class="component">
                <img src="${component.image}" alt="${
                  component.category
                }" onerror="this.style.display='none'">
                <div class="component-info">
                  <div class="component-category">${component.category}</div>
                  <div class="component-name">${component.name}</div>
                </div>
                <div class="component-price">${component.price.toLocaleString(
                  'vi-VN'
                )} VND</div>
              </div>
            `
              )
              .join('')}
          </div>
          
          <div class="total">
            Tổng tiền: ${total.toLocaleString('vi-VN')} VND
          </div>
          
          <div class="footer">
            <p>Được tạo từ hệ thống Build PC</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  return (
    <div className='fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 text-white'>
          <div>
            <h2 className='text-xl font-bold'>Cấu Hình Build PC</h2>
            <p className='text-red-100 text-sm'>
              Ngày tạo: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-red-600 hover:text-white rounded-full transition-all duration-200 ease-in-out'
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 max-h-[60vh] overflow-y-auto'>
          {selectedComponents.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <p>Chưa có linh kiện nào được chọn</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {selectedComponents.map((component, index) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <img
                    src={component.image}
                    alt={component.category}
                    className='w-16 h-16 object-contain bg-gray-100 rounded-lg p-2'
                  />
                  <div className='flex-1'>
                    <div className='text-sm text-gray-500 font-medium mb-1'>
                      {component.category}
                    </div>
                    <div className='font-medium text-gray-800 text-sm leading-tight'>
                      {component.name}
                    </div>
                  </div>
                  <div className='text-lg font-bold text-red-600'>
                    {component.price.toLocaleString('vi-VN')} VND
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {selectedComponents.length > 0 && (
            <div className='mt-6 pt-6 border-t-2 border-red-500'>
              <div className='flex justify-between items-center'>
                <span className='text-base font-semibold text-gray-700'>
                  Tổng tiền:
                </span>
                <span className='text-lg font-bold text-red-600'>
                  {total.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end'>
          <button
            onClick={handleExportPDF}
            className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
          >
            <FiDownload size={16} />
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfigViewModal;
