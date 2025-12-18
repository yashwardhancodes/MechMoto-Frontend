'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Carousel = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  const mobileSlides = [
    '/assets/carausal/mob1.png',
    '/assets/carausal/mob2.png',
    '/assets/carausal/mob3.png',
    '/assets/carausal/mob4.png',
  ];

  const desktopSlides = [
    '/assets/carausal/1.png',
    '/assets/carausal/2.png',
    '/assets/carausal/3.png',
    '/assets/carausal/4.png',
  ];

  const slidesToRender = isMobile ? mobileSlides : desktopSlides;

  return (
    <div className="mb-3 md:mb-4 lg:mb-6">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        spaceBetween={20}
        slidesPerView={1}
        loop
      >
        {slidesToRender.map((src, index) => (
          <SwiperSlide key={index}>
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              width={1200}
              height={500}
              className="w-full h-auto"
              priority={index === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
