import { useState } from "react";
import AddressForm from "@/components/features/auth/AddressForm";
import PaymentMethods from "@/components/features/checkout/PaymentMethods";
import OrderSummary from "@/components/cart/OrderSummary";

function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState("cod");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <AddressForm />
          <PaymentMethods
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        </div>
        <div className="lg:w-1/3">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
