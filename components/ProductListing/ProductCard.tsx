'use client';
import React from 'react';
import { FiExternalLink } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { FiBookmark } from "react-icons/fi";
import Link from 'next/link';
import Image from 'next/image';

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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="border border-[#E9E9E9] rounded-lg overflow-hidden   ">
      <div className="relative w-full h-48">
        <Image
          src={product.image}
          alt={product.alt}
          height={100}
          width={100}
          className="w-full h-full object-cover"
        />
        {product.isGreatPrice && (
          <div className="absolute top-2 left-2 bg-[#3D923A] text-white text-xs font-medium px-2 py-1 rounded">
            Great Price
          </div>
        )}
      
        <button
          onClick={handleBookmark}
          className="absolute top-2 right-2 bg-white bg-opacity-80 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{ color: isBookmarked ? '#ff4757' : '#333' }}
        >
        {isBookmarked ? <FaBookmark className="text-[#3D923A] " /> : <FiBookmark />}

        </button>
      </div>
      <div className="p-4 font-dm-sans">
        <div className="text-base font-semibold mb-2">{product.title}</div>
        <div className="text-sm text-black mb-4">{product.specs}</div>
        <div className="text-lg font-bold mb-2 flex items-center">
          {product.oldPrice && (
            <span className="text-sm   text-gray-500 line-through mr-2">
              {product.oldPrice}
            </span>
          )}
          {product.price}
        </div>
        <div className='flex items-center justify-between  '>
            <Link href={`/products/${product.id}`} prefetch className="text-[#405FF2] text-sm font-medium  inline-flex items-center gap-1">
          View Details <FiExternalLink className="mt-[-2px]" />
        </Link>
            {product.discount && (
          <div className=" w-fit bg-[rgba(154,225,68,0.56)]   text-[#050B20] text-xs font-medium px-2 py-1 rounded">
            {product.discount}
          </div>
        )}
        </div>
      

      </div>
    </div>
  );
};

export default ProductCard;