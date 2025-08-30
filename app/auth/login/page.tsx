"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/lib/redux/api/authApi";
import { loginSchema } from "@/lib/schema/loginSchema";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import logo from "@/public/assets/logo.png";
import google from "@/public/assets/Google.png";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store"; // adjust if store path different

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [showPassword, setShowPassword] = useState(false);
	const [login, { isLoading }] = useLoginMutation();

	const router = useRouter();
	const dispatch = useDispatch();
	const { user, role, loading } = useAuth();

	// Grab redirect path from redux
	const redirectPath = useSelector((state: RootState) => state.redirect.path);

	useEffect(() => {
		if (user) {
			let finalPath = "/";

			// ✅ Redirect path has highest priority
			if (redirectPath && redirectPath.trim() !== "") {
				finalPath = redirectPath;
				router.push(finalPath);
 				return; // stop here, don't check roles
			}

			// ✅ Role-based fallback
			if (role === ROLES.SUPER_ADMIN) {
				finalPath = "/admin/";
			} else if (role === ROLES.VENDOR) {
				finalPath = "/vendor/dashboard";
			}

			router.push(finalPath);
		}
	}, [user, role, router, redirectPath, dispatch]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			const parsedData = loginSchema.parse(formData);
			const result = await login(parsedData).unwrap();
			if (result.success) {
				toast.success("Login successful! Redirecting...");
			} else {
				toast.error("Login failed. Please try again.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formattedErrors: { [key: string]: string } = {};
				err.errors.forEach((e) => {
					formattedErrors[e.path[0]] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Validation failed!");
			} else {
				toast.error(err?.data?.message ?? "Something went wrong!");
			}
		}
	};

	if (loading || user) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-between h-screen">
			<div className="flex justify-center items-center lg:h-[calc(100vh-64px)] my-auto">
				<div className="flex flex-col w-full max-w-md mx-auto">
					<div className="flex flex-col justify-center items-center">
						<Image src={logo} alt="logo" className="size-16 mb-4" />
						<h1 className="font-sans font-semibold text-2xl">Welcome Back!</h1>
						<p className="text-sm font-semibold text-[#1C274C] mt-2">
							Login to your account
						</p>
					</div>
					<hr className="my-4 border-[rgba(0,0,0,0.35)]" />

					{/* Form */}
					<div className="space-y-4 px-6">
						<div>
							<label className="font-sans text-sm font-semibold text-[#1C274C]">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 focus:outline-none focus:border-black transition"
							/>
							{errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
						</div>
						<div>
							<label className="font-sans text-sm font-semibold text-[#1C274C]">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									value={formData.password}
									onChange={handleChange}
									className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 pr-10 focus:outline-none focus:border-black transition"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-black"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && (
								<p className="text-red-500 text-xs">{errors.password}</p>
							)}
						</div>

						<div className="flex justify-between items-center text-sm text-[#1C274C]">
							<label className="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" className="accent-[#6BDE23] size-4" />
								<span className="font-semibold">Remember Me</span>
							</label>
							<Link
								href="/forgot-password"
								className="text-[#413B89] font-semibold hover:underline"
							>
								Recover Password?
							</Link>
						</div>

						<button
							onClick={handleSubmit}
							disabled={isLoading}
							className="w-full rounded-3xl py-2 bg-[#6BDE23] text-white font-semibold disabled:opacity-50"
						>
							{isLoading ? "Logging In..." : "Login"}
						</button>
					</div>

					{/* Divider */}
					<div className="flex items-center justify-center gap-2 my-4 text-[#1C274C]">
						<hr className="flex-grow border-t border-[rgba(0,0,0,0.35)]" />
						<span className="text-sm">Or</span>
						<hr className="flex-grow border-t border-[rgba(0,0,0,0.35)]" />
					</div>

					<button className="flex items-center justify-center gap-4 w-full px-3 py-2 bg-[#F3F9FA] rounded-md">
						<Image src={google} alt="Google Logo" className="size-5" />
						<span className="text-sm font-sans">Sign in With Google</span>
					</button>

					<div className="flex justify-center my-4 text-sm">
						<span>Don't have an account? </span>
						<Link href="/auth/signup" className="text-[#6BDE23] ml-1">
							Register Now
						</Link>
					</div>
				</div>
			</div>

			<footer className="border-t border-[rgba(0,0,0,0.35)] h-12 text-[#1C274C] flex items-center justify-center text-sm">
				© 2023 GrowthX. All Rights Reserved. Designed, Built & Maintained by Sid*
			</footer>
		</div>
	);
};

export default LoginPage;
