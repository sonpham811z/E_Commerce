import AddressForm from '@/components/features/auth/AddressForm';
import OrderSummary from '@/components/features/orders/OrderSummary';
import SubmitOrderButton from '@/components/features/orders/SubmitOrderButton';

function ShippingInfoPage() {
  const handleSubmitOrder = () => {
    console.log('Order submitted');
  };

  return (
    <div className='max-w-7xl mx-auto p-6 font-sans'>
      <h1 className='text-3xl font-bold mb-8'>Đặt hàng</h1>{' '}
      <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
        {' '}
        <AddressForm />
        <OrderSummary />
        <SubmitOrderButton onClick={handleSubmitOrder} />
      </div>
      <footer className='py-6 mt-8 text-center'></footer>
    </div>
  );
}

export default ShippingInfoPage;
