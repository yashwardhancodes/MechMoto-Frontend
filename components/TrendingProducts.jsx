'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useState } from 'react';

const products = [
    { id: 1, name: "Shock up", desc: "High-quality shock absorber", price: "RS.15,000", image: "/assets/shock.png" },
    { id: 2, name: "Shock up", desc: "High-quality shock absorber", price: "RS.15,000", image: "/assets/shock.png" },
    { id: 3, name: "Shock up", desc: "High-quality shock absorber", price: "RS.15,000", image: "/assets/shock.png" },
    { id: 4, name: "Shock up", desc: "High-quality shock absorber", price: "RS.15,000", image: "/assets/shock.png" },
    { id: 5, name: "Shock up", desc: "High-quality shock absorber", price: "RS.15,000", image: "/assets/shock.png" },
];

export default function TrendingProducts() {
     const [savedProducts, setSavedProducts] = useState({});

     const toggleSave = (id) => {
        setSavedProducts(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <section className="py-10 px-4 md:px-12 lg:px-24 bg-white relative">
            <h1 className=" text-2xl md:text-4xl font-sans text-center mt-12 font-bold">
                Trending{" "}
                <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
                    products
                </span>
            </h1>

            <div className="flex justify-end mb-4 lg:mb-10">
                <div className="text-[10px] md:text-sm font-medium text-[#050B20] flex items-center space-x-1">
                    <span>Category By</span>
                    <span className="text-black">▼</span>
                </div>
            </div>

            <div className="relative">
                <button className="custom-prev hidden md:block absolute -left-8 lg:-left-15 top-1/2 -translate-y-1/2 z-20  ">
                    <span className="text-black">◀</span>
                </button>

                <button className="custom-next hidden md:block absolute -right-8 lg:-right-15 top-1/2 -translate-y-1/2 z-20  ">
                    <span className="text-black">▶</span>

                </button>

                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: '.custom-next',
                        prevEl: '.custom-prev',
                    }}
                    spaceBetween={10}
                    slidesPerView={2}
                    breakpoints={{
                        640: { slidesPerView: 3 },
                        768: { slidesPerView: 3,
                            spaceBetween:20
                              },
                        1024: { slidesPerView: 4,
                              spaceBetween:20
                         },
                    }}
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <div className="border border-[rgba(0,0,0,0.14)]  p-3 lg:p-5 bg-white relative    ">
                                {/* Bookmark icon */}
                                <button
                                    onClick={() => toggleSave(product.id)}
                                    className="absolute top-3 right-3 hover:text-black text-gray-400 p-1 rounded"
                                    aria-pressed={!!savedProducts[product.id]}
                                >
                                    <Image
                                        src={savedProducts[product.id] ? "/assets/saved.png" : "/assets/save.png"}
                                        alt={savedProducts[product.id] ? "saved" : "save"}
                                        width={12}
                                        height={12}
                                        className="object-contain"
                                    />
                                </button>

                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={250}
                                    height={250}
                                     className="object-contain h-32 lg:h-56  mx-auto md:w-auto"
                                />

                                <div className="text-left font-sans mt-4">
                                    <h3 className="font-semibold text-sm lg:text-base">{product.name}</h3>
                                    <p className=" text-[10px] lg:text-sm  ">{product.desc}</p>
                                    <p className="font-bold text-lg lg:text-xl text-black mt-2">{product.price}</p>
                                </div>

                                <button className="absolute bottom-3 md:bottom-4 right-4 bg-[#9AE144] text-black px-1 md:px-2 py-2 md:py-3 rounded-full transition">
                                    <ArrowUpRight size={18}  className='size-[14px] lg:size-[18px]'/>
                                </button>

                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
