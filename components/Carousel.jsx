import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';

const Carousel = () => {
  return (
    <div className=" mb-3 md:mb-4 lg:mb-6">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        className="overflow-hidden"
      >
        <SwiperSlide>
          <img src="/assets/banner1.png" alt="Slide 1" className="w-full h-auto" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/assets/banner1.png" alt="Slide 2" className="w-full h-auto" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/assets/banner1.png" alt="Slide 3" className="w-full h-auto" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Carousel;
