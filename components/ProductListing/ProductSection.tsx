'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  title: string;
  specs: string;
  price: string;
  oldPrice?: string;
  image: string;
  alt: string;
  isGreatPrice?: boolean;
  discount?: string;
}

const ProductsSection: React.FC = () => {
  const products: Product[] = [
    {
      id: 1,
      title: 'Time- Belt',
      specs: '15 Miles • Petrol • CVT',
      price: 'Rs-15,000',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      alt: 'Range Rover',
    },
    {
      id: 2,
      title: 'C-Class – 2023',
      specs: '50 Miles • Petrol • Automatic',
      price: 'Rs-15,000',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=200&fit=crop',
      alt: 'C-Class',
    },
    {
      id: 3,
      title: 'Ford Transit – 2021',
      specs: '2500 Miles • Diesel • Manual',
      price: 'Rs-15,000',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
      alt: 'Ford Transit',
      isGreatPrice: true,
    },
    {
      id: 4,
      title: 'T-Cross – 2023',
      specs: '15 Miles • Petrol • CVT',
      price: 'Rs-15,000',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      alt: 'T-Cross',
    },
    {
      id: 5,
    title: 'C-Class – 2023',
      specs: '50 Miles • Petrol • Automatic',
      price: 'Rs-15,000',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=200&fit=crop',
      alt: 'C-Class',
    },
    {
      id: 6,
      title: 'Ford Transit – 2021',
      specs: '2500 Miles • Diesel • Manual',
      price: '1000/-',
      oldPrice: 'Rs- 2000',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
      alt: 'Ford Transit',
      isGreatPrice: true,
      discount: '-20%',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg c">
      <div className="mb-5">
        <h1 className="text-4xl text-[rgba(23,24,59,1)] font-dm-sans   mb-2">
          Timing Belt parts for <span className="text-[#9AE144]">Chevrolet Aveo 1.2L</span>
        </h1>
        <div className="text-[#9AE144] text-base font-roboto font-medium">42 Parts available</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;