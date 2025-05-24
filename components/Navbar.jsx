import React from 'react'
import Image from 'next/image'
import navLogo from '../public/assets/navLogo.png'
import Link from 'next/link'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';




const Navbar = () => {
    return (
        <div className='px-12 flex justify-between items-center h-[56px] bg-[#050B20] font-sans text-white'>
            <div>
                <Image src={navLogo} alt="logo" className='h-[52px] w-auto' />
            </div>
            <div className='flex items-center gap-8 text-sm  '>

                <div className='flex items-center gap-8'>
                    <Link href={"/"}>Home</Link>
                    <Link href={"/about"}>About Us</Link>
                    <Link href={"/about"}>Contact</Link>
                </div>
                <div className='bg-[#D9D9D9] h-[26px] w-[160px] rounded-3xl flex items-center justify-between pl-2 pr-0.5'>
                    <input
                        type="text"
                        placeholder='Search'
                        className='bg-transparent text-xs text-[#3E3E3E] outline-none w-full pr-1'
                    />
                    <div className='bg-[#050B20] size-[22px] rounded-full flex items-center justify-center shrink-0'>
                        <FontAwesomeIcon icon={faSearch} className='text-white size-3' />
                    </div>
                </div>
                <div className='flex space-x-2 items-center cursor-pointer justify-center'>
                    <FontAwesomeIcon icon={faUser} className="text-sm" />
                    <span >Sign in</span>
                </div>
                <button className="flex items-center justify-between gap-2 px-4 py-2 rounded-3xl bg-gradient-to-r from-[#1F5B05] to-[#9AE144] text-black font-medium shadow-md">
                    <span >My Cart</span>
                    <FontAwesomeIcon icon={faCartShopping} className="text=sm" />
                </button>
            </div>



        </div>
    )
}

export default Navbar