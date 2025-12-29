'use client';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'Nikhil Singar',
    role: 'Customer',
    image: '/assets/testimonials/NikhilSingar.jpeg',
    title: 'विश्वसनीय Spare Parts Platform',
    text: 'Mech-Moto कडून मी अनेक वेळा car spare parts घेतले असून price market पेक्षा reasonable आहेत, parts original quality चे मिळाले, delivery वेळेवर झाली आणि car owners व mechanics दोघांसाठीही हा एक भरोसेमंद platform आहे – highly recommended 👍',
    rating: 5
  },
  
  {
    name: 'Pandurang More',
    role: 'Customer',
    image: '/assets/testimonials/PandurangMore.jpeg',
    title: 'Mechanic’s Best Choice',
    text: 'मी mechanic असून Mech-Moto मुळे correct part selection, proper guidance, fast delivery आणि technical support मिळाल्याने माझा वेळ व पैसा दोन्ही वाचतो आणि workshop साठी हे best spare parts platform आहे.',
    rating: 4.5
  },
  {
    name: 'Sachin Shinde',
    role: 'Customer',
    image: '/assets/testimonials/SachinShinde.jpeg',
    title: 'Great First Experience',
    text: 'आज पहिल्यांदा Mech-Moto वरून order केली, experience खूपच चांगला राहिला, pricing transparent आहे, hidden charges नाहीत, parts quality top class आहे आणि future मध्ये सगळी spare parts requirement इथूनच घेणार आहे.',
    rating: 4.5
  },
  {
    name: 'Nilesh Khamkar,',
    role: 'Customer',
    image: '/assets/testimonials/NileshKhamkar.jpeg',
    title: 'भरोसेमंद Auto Parts',
    text: 'Original parts, best price आणि excellent support 👍 Mech-Moto = Trusted auto spare parts platform',
    rating: 4.5
  },
  {
    name: 'Prashant Raut',
    role: 'Customer',
    image: '/assets/testimonials/PrashantRaut.jpeg',
    title: 'Reliable Platform',
    text: 'मी माझ्या friend च्या reference ने Mech-Moto वरून parts मागवले, चांगला discount मिळाला, quality बाबत कुठलीही तक्रार नाही, customer handling खूप professional आहे आणि duplicate parts च्या काळातही इथे genuine parts मिळतात, त्यामुळे नक्कीच पुन्हा order करणार.',
    rating: 5
  },
  {
    name: 'Chetan Dolas',
    role: 'Customer',
    image: '/assets/testimonials/ChetanDolas.jpeg',
    title: 'Lifesaver Service',
    text: 'I had taken a Mech-Moto subscription, and it turned out to be extremely useful for me. When my car broke down on the roadside, the Mech-Moto team immediately arranged a mechanic and resolved the problem quickly. I received proper guidance over the call, which helped me avoid unnecessary expenses. Because of the subscription, the service was fast and the experience was completely tension-free. For car owners, Mech-Moto is truly a trustworthy and helpful service, and I would definitely recommend it 👍',
    rating: 4.5
  }
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating); 
  const halfStar = rating % 1 !== 0;
  return (
    <div className="text-black text-2xl md:text-lg">
      {'★'.repeat(fullStars)}
      {halfStar && <span className="text-green-500">★</span>}
    </div>
  );
};

// New Component for Truncated Text with Read More/Less
const TestimonialText: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.trim().split(/\s+/);
  const isLong = words.length > 10;
  const shortText = isLong ? words.slice(0, 20).join(' ') + '...' : text;
  const displayText = isExpanded ? text : shortText;

  return (
    <p
      className={`text-[#050B20] text-xs md:text-xs lg:text-sm mb-6 text-left transition-all duration-300 relative ${
        isExpanded
          ? 'bg-white p-6 rounded-xl   z-20 -mx-6 md:-mx-3 lg:-mx-8 -my-4'
          : 'md:h-14 lg:h-16'
      }`}
      style={isExpanded ? { zIndex: 20 } : undefined}
    >
      “{displayText}
      {isLong && !isExpanded && (
        <>
          {' '}
          <span
            onClick={() => setIsExpanded(true)}
            className="  cursor-pointer underline   font-medium"
          >
            read more
          </span>
        </>
      )}
      {isExpanded && isLong && (
        <>
          {' '}
          <span
            onClick={() => setIsExpanded(false)}
            className="text-blue-600 cursor-pointer underline hover:text-blue-800 font-medium"
          >
            read less
          </span>
        </>
      )}
      ”
    </p>
  );
};

export default function Testimonials() {
  return (
    <>
      <h1 className="text-2xl md:text-4xl font-sans text-center mb-10 font-bold">
        What Our{" "}
        <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
          Customers Say
        </span>
      </h1>

      <section className="bg-[#9AE144] py-8 lg:py-12 pb-16 lg:pb-20 md:px-6 px-10 lg:px-12">
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
                <div className="bg-white flex flex-col md:block justify-between rounded-xl h-60 md:h-full p-3 px-6 md:px-3 md:p-6 lg:px-8 shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[20px] md:text-sm lg:text-lg font-semibold text-[#050B20]">
                      {testimonial.title}
                    </h3>
                    <span className="text-6xl md:text-4xl lg:text-6xl text-[#050B20] font-serif">
                      “
                    </span>
                  </div>

                  {/* Replaced the original <p> with the new component */}
                  <TestimonialText text={testimonial.text} />

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
          <button className="testimonial-prev absolute -bottom-12 md:-bottom-14 lg:-bottom-16 left-1/2 transform -translate-x-[180%] z-10 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition">
            <ChevronLeft size={20} />
          </button>
          <button className="testimonial-next absolute -bottom-12 md:-bottom-14 lg:-bottom-16 left-1/2 transform translate-x-[80%] z-10 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <div className="w-full overflow-hidden rotate-180 leading-none relative md:-mt-8">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-[60px] sm:h-[80px] md:h-[120px] lg:h-[160px] xl:h-[200px]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path fill="#9AE144" d="M0,0 C480,200 960,200 1440,0 L1440,200 L0,200 Z"></path>
        </svg>
      </div>

      
    </>
  );
}





{/* testimonial video */}
      // <div className="bg-white py-8 px-4 md:mx-auto md:px-auto">
      //   {/* ✅ Mobile View - Custom Layout */}
      //   <div className="max-w-2xl mx-auto grid grid-cols-6 gap-4 md:hidden">
      //     {/* Row 1: Centered video (middle 3 columns) */}
      //     <div></div>
      //     <div className="col-span-3 rounded-2xl overflow-hidden shadow-md bg-gray-200 aspect-video h-32">
      //       <video className="w-full h-full object-cover" controls preload="metadata">
      //         <source src="/assets/videos/testimonial1.mp4" type="video/mp4" />
      //         Your browser does not support the video tag.
      //       </video>
      //     </div>
      //     <div></div>

      //     {/* Row 2: Left and Right videos */}
      //     <div className="col-span-2 rounded-2xl overflow-hidden shadow-md bg-gray-200 aspect-video h-20">
      //       <video className="w-full h-full object-cover" controls preload="metadata">
      //         <source src="/assets/videos/testimonial1.mp4" type="video/mp4" />
      //         Your browser does not support the video tag.
      //       </video>
      //     </div>
      //     <div></div>
      //     <div className="col-span-2 rounded-2xl overflow-hidden shadow-md bg-gray-200 aspect-video h-20">
      //       <video className="w-full h-full object-cover" controls preload="metadata">
      //         <source src="/assets/videos/testimonial1.mp4" type="video/mp4" />
      //         Your browser does not support the video tag.
      //       </video>
      //     </div>
      //   </div>

      //   {/* ✅ Tablet & Desktop View - Original Layout */}
      //   <div className="hidden md:grid max-w-7xl mx-auto grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
      //     {[1, 2, 3].map((_, index: number) => (
      //       <div
      //         key={index}
      //         className="rounded-2xl overflow-hidden shadow-md bg-gray-200 aspect-video flex items-center justify-center"
      //       >
      //         <video className="w-full h-full object-cover" controls preload="metadata">
      //           <source src="/assets/videos/testimonial1.mp4" type="video/mp4" />
      //           Your browser does not support the video tag.
      //         </video>
      //       </div>
      //     ))}
      //   </div>
      // </div>