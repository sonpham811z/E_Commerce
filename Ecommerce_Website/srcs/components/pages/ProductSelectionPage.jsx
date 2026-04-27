// import { useState } from "react";
// import ProductFilters from "@/components/features/products/ProductFilters";
// import ProductGrid from "@/components/features/products/ProductGrid";

// function ProductSelectionPage() {
//   const [selectedBrand, setSelectedBrand] = useState("all");
//   const [sortBy, setSortBy] = useState("default");

//   return (
//     <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
//         {/* Header - ProductFilters */}
//         <ProductFilters
//           selectedBrand={selectedBrand}
//           onBrandChange={setSelectedBrand}
//           sortBy={sortBy}
//           onSortChange={setSortBy}
//         />

//         {/* Product Grid */}
//         <ProductGrid filter={selectedBrand} sort={sortBy} />

//         {/* Footer - You can add your footer here */}
//         <footer className="mt-8 text-center text-gray-500">
//           {/* Placeholder for Footer */}
//         </footer>
//       </div>
//     </div>
//   );
// }

// export default ProductSelectionPage;
