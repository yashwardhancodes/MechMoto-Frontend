"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../../public/assets/logo.png";
import google from "../../public/assets/Google.png";
import { useSignupUserMutation } from "../../lib/redux/api/signupSlice";
import { signupSchema } from "../../lib/schema/signupSchema";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link"; // Import Link for navigation

const Page = () => {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		phone: "",
	});

	const [errors, setErrors] = useState({});
	const [signup, { isLoading }] = useSignupUserMutation(); // ✅ Using mutation hook
	const router = useRouter();

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			const parsedData = signupSchema.parse(formData);
			console.log("✅ Valid Data:", parsedData);

			const result = await signup(parsedData).unwrap();
			console.log("✅ API Response:", result);

			if (result?.success) {
				toast.success("Signup successful! Redirecting...");
				window.location.href = "/"; // Fallback to ensure redirection
			} else {
				toast.error("Signup failed. Please try again.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formattedErrors: { [key: string]: string } = {};
				err.errors.forEach((e) => {
					formattedErrors[e.path[0]] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Validation failed!", formattedErrors);
				console.log("❌ Validation Errors:", formattedErrors);
			} else {
				console.error("❌ Error:", err);
				toast.error("Something went wrong!", err);
			}
		}
	};

	const [showPassword, setShowPassword] = useState(false);

	const togglePassword = () => setShowPassword((prev) => !prev);

	return (
		<>
			<div className="flex flex-col justify-between h-screen">
				<div className="flex justify-center items-center lg:h-[calc(100vh-64px)] my-auto">
					<div className="flex flex-col w-full">
						<div className="flex flex-col justify-center items-center">
							<div className="flex flex-col">
								<Image
									src={logo}
									alt="logo"
									className="size-12 md:size-16 lg:size-[88px]"
								/>
							</div>
							<h1 className="font-sans font-semibold text-xl md:text-2xl lg:text-4xl">
								Welcome!
							</h1>
							<p className="text-xs md:text-sm md:mt-1 lg:mt-2 font-semibold text-[#1C274C]">
								Signup to your account
							</p>
						</div>

						<div className="w-3/4 md:w-1/2 lg:w-1/3 mx-auto border-t-1 my-2 lg:my-3 border-[rgba(0,0,0,0.35)]" />

						<div className="flex flex-col justify-center items-center">
							<div className="w-3/4 md:w-1/2 lg:w-1/3 px-9 space-y-2 lg:space-y-3 mt-2">
								<p className="font-sans text-xs md:text-sm font-semibold text-[#1C274C]">
									Enter Your Name
								</p>
								<input
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 lg:py-2 focus:outline-none focus:border-black transition"
								/>
							</div>

							<div className="w-3/4 md:w-1/2 lg:w-1/3 px-9 space-y-2 lg:space-y-3 mt-2">
								<p className="font-sans text-xs md:text-sm font-semibold text-[#1C274C]">
									Enter Your Email
								</p>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 lg:py-2 focus:outline-none focus:border-black transition"
								/>
							</div>

							<div className="w-3/4 md:w-1/2 lg:w-1/3 px-9 space-y-2 lg:space-y-3 mt-2">
								<p className="font-sans text-xs md:text-sm font-semibold text-[#1C274C]">
									Enter Your Phone Number
								</p>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 lg:py-2 focus:outline-none focus:border-black transition"
								/>
							</div>

							<div className="w-3/4 md:w-1/2 lg:w-1/3 px-9 space-y-2 lg:space-y-3 mt-2">
								<p className="font-sans text-xs md:text-sm font-semibold text-[#1C274C]">
									Enter Your Password
								</p>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleChange}
										className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 lg:py-2 pr-10 focus:outline-none focus:border-black transition"
									/>
									<button
										type="button"
										onClick={togglePassword}
										className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-black"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							<div className="flex justify-between px-9 items-center w-3/4 md:w-1/2 lg:w-1/3 text-[12px] md:text-sm text-[#1C274C] mt-2">
								<label className="flex items-center gap-1 md:gap-2 cursor-pointer">
									<input
										type="checkbox"
										className="accent-[#6BDE23] md:size-4 size-3"
									/>
									<span className="font-semibold">Remember Me</span>
								</label>
								<a
									href="#"
									className="text-[#413B89] font-semibold hover:underline"
								>
									Recover Password?
								</a>
							</div>

							<div className="px-9 mt-3 lg:mt-4 w-3/4 md:w-1/2 lg:w-1/3 flex justify-between items-center">
								<button
									onClick={handleSubmit}
									className="rounded-3xl py-2 lg:py-2 w-full text-sm md:text-base bg-[#6BDE23] text-white font-semibold"
								>
									SignUp
								</button>
							</div>
						</div>

						<div className="flex items-center mx-auto justify-center gap-2 w-3/4 md:w-1/2 lg:w-1/3 my-2 lg:my-2 text-[#1C274C] text-sm">
							<div className="flex-grow border-t border-[rgba(0,0,0,0.35)]" />
							<span className="text-sm md:text-base">Or</span>
							<hr className="flex-grow border-t border-[rgba(0,0,0,0.35)]" />
						</div>

						<div className="flex items-center justify-center px-9 w-3/4 md:w-1/2 lg:w-1/3 mx-auto">
							<button className="bg-[#F3F9FA] w-full px-3 py-2 lg:py-2 rounded-md flex items-center justify-center gap-4">
								<Image
									src={google}
									alt="Google Logo"
									className="md:size-[25px] size-[20px]"
								/>
								<span className="text-xs md:text-sm font-sans">
									Sign in With Google
								</span>
							</button>
						</div>

						<div className="flex my-2 lg:my-2 font-sans text-xs md:text-sm mx-auto">
							<span>Already have an account? </span>
							<Link href={"/login"}>
								<span className="text-[#6BDE23]">&nbsp; Sign In</span>
							</Link>
						</div>
					</div>
				</div>

				<div className="border-t-[rgba(0,0,0,0.35)] border-t-1 h-[40px] lg:h-[55px] text-[#1C274C] items-center justify-center hidden md:flex md:text-[12px] lg:text-sm">
					© 2023 GrowthX. All Rights Reserved. Designed, Built & Maintained by Sid*
				</div>
			</div>
		</>
	);
};

export default Page;
