 import FilterSection from '@/components/ProductListing/FilterSection';
import ProductsSection from '@/components/ProductListing/ProductSection';
import React from 'react';


export default function Product() {
  return (
     
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:gap-8">
        <FilterSection />
        <ProductsSection />
      </div>
 
  );
}