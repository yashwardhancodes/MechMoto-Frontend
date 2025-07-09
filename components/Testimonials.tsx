'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'Leslie Alexander',
    role: 'Facebook',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    title: 'Great Work',
    text: 'Amazing design, easy to customize and a design quality superlative account on its cloud platform for the optimized performance. And we didn’t on our original designs.',
    rating: 5
  },
  {
    name: 'Floyd Miles',
    role: 'Designer',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    title: 'Awesome Design',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rating: 4.5
  },
  {
    name: 'Jane Doe',
    role: 'YouTube',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    title: 'Excellent Service',
    text: 'Very responsive and professional team. Love the product interface and how it just works perfectly for us!',
    rating: 4.5
  },
  {
    name: 'John Smith',
    role: 'Developer',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    title: 'Highly Recommend',
    text: 'Fast, reliable, and excellent customer support. This is everything we needed and more.',
    rating: 4.5
  }
];

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  return (
    <div className="text-black text-2xl md:text-lg">
      {'★'.repeat(fullStars)}
      {halfStar && <span className="text-green-500">★</span>}
    </div>
  );
};

export default function Testimonials() {
  return (
    <>
      <h1 className="text-4xl font-sans text-center mt-12 mb-6 font-bold">
        What our{' '}
        <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
          customers say
        </span>
      </h1>

      <section className="bg-lime-400 py-8 lg:py-12 pb-16 lg:pb-20 md:px-6 px-12 lg:px-12">
        <p className="text-right hidden md:block md:text-[12px] lg:text-sm text-gray-900 mb-6">
          Rated 4.7 / 5 based on 28,370 reviews Showing our 4 & 5 star reviews
        </p>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: '.testimonial-prev',
              nextEl: '.testimonial-next',
            }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((testimonial, idx) => (
              <SwiperSlide key={idx}>
                <div className="bg-white rounded-xl p-3 px-6 md:px-3 md:p-6 lg:px-8 shadow-md h-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[20px] md:text-sm lg:text-lg font-semibold text-[#050B20]">
                      {testimonial.title}
                    </h3>
                    <span className="text-6xl md:text-4xl lg:text-6xl text-[#050B20] font-serif">
                      “
                    </span>
                  </div>
                  <p className="text-[#050B20] text-sm md:text-xs lg:text-sm mb-6 text-left md:h-14 lg:h-16">
                    “{testimonial.text}”
                  </p>
                  <div className="flex md:flex-row flex-col md:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="rounded-full w-12 h-12 lg:w-16 lg:h-16"
                        width={64}
                        height={64}
                        loading="lazy"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="md:mb-0 md:mt-4 text-right md:text-left">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Unique Navigation Buttons for this Swiper only */}
          <button
            className="testimonial-prev absolute -bottom-12 md:-bottom-14 lg:-bottom-16 left-1/2 transform -translate-x-[180%] z-10 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="testimonial-next absolute -bottom-12 md:-bottom-14 lg:-bottom-16 left-1/2 transform translate-x-[80%] z-10 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </>
  );
}
