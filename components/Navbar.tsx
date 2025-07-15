'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import navLogo from '../public/assets/navLogo.png'
import Link from 'next/link'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <>
            {/* Desktop Navbar */}
            <div className='fixed top-0 w-full z-50 px-6 lg:px-12 hidden md:flex justify-between items-center md:h-[50px] lg:h-[56px] bg-[#050B20] font-sans text-white'>
                <div>
                    <Image src={navLogo} alt="logo" className='h-[45px] lg:h-[52px] w-auto' />
                </div>
                <div className='flex items-center gap-4 lg:gap-8 text-xs lg:text-sm'>
                    <div className='flex items-center gap-4 lg:gap-8'>
                        <Link href={"/"}>Home</Link>
                        <Link href={"/about"}>About Us</Link>
                        <Link href={"/about"}>Contact</Link>
                    </div>
                    <div className='bg-[#D9D9D9] h-[22px] lg:h-[26px] w-[120px] lg:w-[160px] rounded-3xl flex items-center justify-between pl-2 pr-0.5'>
                        <input
                            type="text"
                            placeholder='Search'
                            className='bg-transparent text-xs text-[#3E3E3E] outline-none w-full pr-1'
                        />
                        <div className='bg-[#050B20] size-[18px] lg:size-[22px] rounded-full flex items-center justify-center shrink-0'>
                            <FontAwesomeIcon icon={faSearch} className='text-white size-2.5 lg:size-3' />
                        </div>
                    </div>
                    <Link href={"/login"}>
                        <div className='flex space-x-2 items-center cursor-pointer justify-center'>
                            <FontAwesomeIcon icon={faUser} className="text-sm" />
                            <span>Sign in</span>
                        </div></Link>
                    <button className="flex items-center justify-between gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-3xl bg-gradient-to-r from-[#1F5B05] to-[#9AE144] text-black font-medium shadow-md">
                        <span>My Cart</span>
                        <FontAwesomeIcon icon={faCartShopping} className="text=sm" />
                    </button>
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className='fixed top-0 w-full z-50 md:hidden flex justify-between items-center h-[40px] bg-[#050B20] font-sans text-white px-4'>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className='flex items-center justify-center rounded-full size-[25px] bg-[#9AE144] shrink-0'
                >
                    {sidebarOpen ? <X className='size-4 text-black' /> : <Menu className='size-4 text-black' />}
                </button>
                <div>
                    <Link href={"/"}>
                        <Image src={navLogo} alt="logo" className='h-[35px] w-auto' />
                    </Link>
                </div>
                <div className='flex items-center justify-center gap-2'>
                    <Link href={"/login"}>
                        <FontAwesomeIcon icon={faUser} className="text-sm" />
                    </Link>
                    <button className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#1F5B05] px-2 py-1.5 to-[#9AE144] text-black font-medium shadow-md">
                        <FontAwesomeIcon icon={faCartShopping} className="text-xs" />
                    </button>
                </div>
            </div>

            {/* Sidebar Menu */}
            {sidebarOpen && (
                <div className="md:hidden fixed top-[40px] flex flex-col  left-0 w-2/3 sm:w-1/2 h-full bg-[#050B20] text-white z-50 p-4 space-y-4 transition-all duration-300 ease-in-out">
                    <Link href="/" onClick={() => setSidebarOpen(false)}>Home</Link>
                    <Link href="/about" onClick={() => setSidebarOpen(false)}>About Us</Link>
                    <Link href="/about" onClick={() => setSidebarOpen(false)}>Contact</Link>
                </div>
            )}
        </>
    )
}

export default Navbar
