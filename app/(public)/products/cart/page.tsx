"use client";
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Clock, Truck, ChevronRight } from 'lucide-react';
import { FaCheck } from "react-icons/fa";
import { Trash } from 'lucide-react';
import TrendingProducts from '@/components/TrendingProducts';
import { useRouter } from 'next/navigation';
import CheckoutPopup from '@/components/PopUp/CheckoutPopup';


interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
}

const Page: React.FC = () => {
  const Router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Sweet Green Seedless Grapes 15-2 lb",
      price: 25.98,
      originalPrice: 89.99,
      quantity: 1,
      image: "🍇"
    },
    {
      id: 2,
      name: "Sweet Green Seedless Grapes 15-2 lb",
      price: 25.98,
      originalPrice: 89.99,
      quantity: 1,
      image: "🥝"
    },
    {
      id: 3,
      name: "Sweet Green Seedless Grapes 15-2 lb",
      price: 25.98,
      originalPrice: 89.99,
      quantity: 1,
      image: "🥑"
    },
    {
      id: 4,
      name: "Sweet Green Seedless Grapes 15-2 lb",
      price: 25.98,
      originalPrice: 89.99,
      quantity: 1,
      image: "🍊"
    }
  ]);

  const [trendingProducts] = useState<Product[]>([
    {
      id: 1,
      name: "This is product a",
      price: 99.99,
      originalPrice: 99.99,
      stock: 12,
      image: "🎯"
    },
    {
      id: 2,
      name: "This is product a",
      price: 99.99,
      originalPrice: 99.99,
      stock: 12,
      image: "🔧"
    },
    {
      id: 3,
      name: "This is product a",
      price: 99.99,
      originalPrice: 99.99,
      stock: 12,
      image: "⚙️"
    },
    {
      id: 4,
      name: "This is product a",
      price: 99.99,
      originalPrice: 99.99,
      stock: 12,
      image: "🔗"
    },
    {
      id: 5,
      name: "This is product a",
      price: 99.99,
      originalPrice: 99.99,
      stock: 12,
      image: "🎯"
    }
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.78;
  const subtotal = itemsTotal + deliveryFee;

  return (
    <div className="        ">
      {/* Free Delivery Banner */}
      <div className="flex items-center gap-2 mb-4 ml-6 text-[#9AE144] font-medium text-sm">
        {/* Green box with check icon */}
        <div className="bg-[#9AE144] rounded p-1 flex items-center justify-center">
          <FaCheck className="text-black text-xs" />
        </div>

        {/* Text */}
        <p>
          Free Delivery Unlocked,
          <span className="font-semibold"> apply coupon to avail</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Cart Section */}
        <div className="lg:col-span-2">
  <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.14)] p-6 mb-6">
    {/* Cart Items */}
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-600 mb-4">Cart Items</div>
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-4 border-b border-[rgba(0,0,0,0.14)] last:border-b-0"
        >
          {/* Mobile Layout */}
          <div className="flex items-center justify-between  w-full sm:hidden">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 text-2xl">
                {item.image}
              </div>
              <div>
                <h3 className="font-medium text-xs text-gray-900">{item.name}</h3>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-[#9AE144] font-semibold text-sm">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-gray-400 line-through text-xs">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                </div>
              
              </div>
            </div>
            
            <div className="flex   items-center  gap-2 justify-center space-y-2">
              <div className="flex items-center bg-[rgba(248,247,248,1)] rounded-full px-1 py-1 space-x-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className=" size-4 md:size-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                  <Minus className="size-3 text-black" />
                </button>
                <span className="w-8 text-center font-medium text-black text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className=" size-4 md:size-7 rounded-full bg-[#9AE144] flex items-center justify-center text-white"
                >
                  <Plus className="size-3" />
                </button>

                
              </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className=" text-gray-700    "
                >
                    <Trash className='size-4'></Trash>
                </button>
            </div>
          </div>

          {/* Desktop/Tablet Layout - Original Code Unchanged */}
          <div className="hidden sm:flex items-center flex-1">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-2xl">
              {item.image}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-[#9AE144] font-semibold">
                  ${item.price.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  ${item.originalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center bg-[rgba(248,247,248,1)] rounded-full px-2 py-1 space-x-4">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-100"
              >
                <Trash className="size-4 text-black" />
              </button>
              <span className="w-6 text-center font-medium text-black">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-10 h-10 rounded-full bg-[#9AE144] flex items-center justify-center text-white hover:bg-[#89CC33] shadow-sm"
              >
                <Plus className="size-4" />
              </button>
            </div>
            
            <button
              onClick={() => removeItem(item.id)}
              className="bg-[#E9F8CF] text-[#9AE144] px-3 py-1 rounded-full text-xs font-medium"
            >
              Remove
            </button>
            
            <div className="text-right min-w-16">
              <div className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Footer Buttons */}
    <div className="flex border-t pt-3 border-[rgba(0,0,0,0.14)] justify-between items-center mt-6">
      <h1 className='text-black text-xs md:text-base pl-6 font-semibold'>Missed Something ?</h1>
      <button
        onClick={() => Router.push("/")}
        className="bg-[#9AE144]  flex gap-2 md:text-base text-xs items-center px-4 md:px-6 py-1.5 md:py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
      >
        <Plus className=" text-black size-3 md:size-4" />
        Add More Items
      </button>
    </div>
  </div>
</div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.14)] p-6 px-8 sticky top-4">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full mb-3">
              <div className="h-1 bg-[#9AE144] rounded-full w-1/3"></div>
            </div>

            {/* Free delivery text */}
            <p className="text-sm text-gray-600 mb-4">
              Free delivery + saving <span className="font-medium">$3.00</span> on this order Go to
            </p>

            {/* Heading */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items total</span>
                <span className="text-black">${itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span className="text-black">${deliveryFee.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-[rgba(0,0,0,0.14)] pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
            onClick={()=>{setToggle(true)}}
             className="w-full bg-[#9AE144] hover:bg-[#89CC33] text-black font-medium py-3 rounded-full transition flex items-center justify-between px-6">
              <div  className="flex items-center" >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Checkout
              </div>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </button>

        
          </div>
        </div>


        <div className='lg:col-span-3'>


          <TrendingProducts />


        </div>



      </div>

          {
              toggle && <div>
                 
                 <CheckoutPopup onClose={()=>{setToggle(false)}}></CheckoutPopup>
              </div>
            }

    </div>



  );
};

export default Page;


