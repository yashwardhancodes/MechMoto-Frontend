import React from 'react'
import Image from 'next/image'
import serviceImg from "@/public/assets/service.png"
import helplineImg from "@/public/assets/helpline.png"
import customerServiceImg from "@/public/assets/customerService.png"
import Pricing from './Plans'
import Benefits from './Benefits'
import FAQs from './Faq'

const Service = () => {
  return (
    <div className='pb-96'>
      <div className="relative rounded-2xl flex justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src={serviceImg}
          alt="service Image"
          className="w-[90%] md:w-auto md:h-[400px] lg:h-[650px] object-cover"
        />

        {/* Overlay Content */}
        <div className="absolute top-5 md:top-10 left-10 md:left-25 lg:left-55">
          <h2 className="text-white text-xl md:text-3xl lg:text-5xl font-bold font-sans leading-snug max-w-[280px] md:max-w-[420px] lg:max-w-3xl">
            Need Help Fast?{" "}
            <span className="text-[#9AE144]">Get Premium Support</span> and Get
            Back on the Road!
          </h2>
        </div>

        {/* Button */}
        <button className="absolute bottom-5 md:bottom-10 right-10 md:right-20 lg:right-50 bg-[#9AE144] text-black text-xs md:text-base font-bold px-3 md:px-6 py-2 md:py-3 rounded-full hover:bg-green-500 w-fit">
          Subscribe Now
        </button>
      </div>

      {/* Cards Section */}
      <div className="mt-10 flex flex-col md:flex-row px-36 justify-between items-center">
        {/* Card 1 */}
        <div className="p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black w-[90%] md:w-[470px]">
          <div className="flex items-center gap-4 rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition bg-white">
            <Image src={helplineImg} alt="helpline" width={80} height={80} />
            <div>
              <h3 className="text-xl  font-bold text-gray-900">Need Expert help?</h3>
              <p className="text-sm text-gray-600">
                Get a certified mechanic to your location.
              </p>
            </div>
          </div>
        </div>


        <div className="p-[1.5px] rounded-2xl  bg-gradient-to-l from-[#9AE144] via-green-700 to-black w-[90%] md:w-[470px]">
          <div className="flex items-center  gap-4 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition bg-white">
            <Image src={customerServiceImg} alt="helpline" width={60} height={80} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Live Call Support</h3>
              <p className="text-sm text-gray-600">
                Talk to a car expert in real-time for quick fixes
              </p>
            </div>
          </div>
        </div>



      </div>



      <Pricing />
      <Benefits />

      <FAQs />
    </div>
  )
}

export default Service
