"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/lib/redux/api/authApi";
import { signupSchema } from "@/lib/schema/signupSchema";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import logo from "@/public/assets/logo.png";
import google from "@/public/assets/Google.png"; // Fixed typo in file name
import { ROLES } from "@/constants/roles";
import useAuth from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { RootState } from "@/lib/redux/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const redirectPath = useSelector((state: RootState) => state.redirect.path);

  const { user, role } = useAuth();

  useEffect(() => {
    if (user) {
      let finalPath = "/";

      // Redirect path has highest priority
      if (redirectPath && redirectPath.trim() !== "") {
        finalPath = redirectPath;
        dispatch(setRedirect("")); // Clear after use
      } else if (role !== undefined) {
        if (role === ROLES.SUPER_ADMIN) {
          finalPath = "/admin";
        } else if (role === ROLES.VENDOR) {
          finalPath = "/vendor/dashboard";
        } else if (role === ROLES.USER){
          finalPath = "/"
        } else if (role === ROLES.MECHANIC) {
          finalPath = "/mechanic/dashboard";
        } else if (role === ROLES.SERVICE_CENTER) {
          finalPath = "/service-center/dashboard"
        }
      }
      router.push(finalPath); // Use finalPath instead of redirectPath
    }
  }, [user, role, router, redirectPath, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      const parsedData = signupSchema.parse(formData);
      const result = await signup(parsedData).unwrap();
      if (result.success) {
        toast.success("Signup successful! Redirecting...");
        const redirectPath = "/auth/login";
        router.push(redirectPath);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
      } else if (isFetchBaseQueryError(err)) {
        const errorMessage =
          "data" in err &&
          typeof err.data === "object" &&
          err.data &&
          "message" in err.data
            ? (err.data as { message: string }).message
            : "Something went wrong!";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  // Type guard for RTK Query errors
  function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return (
      typeof error === "object" &&
      error !== null &&
      ("status" in error || "data" in error)
    );
  }

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="flex justify-center items-center lg:h-[calc(100vh-64px)] my-auto">
        <div className="flex flex-col w-full max-w-md mx-auto">
          <div className="flex flex-col justify-center items-center">
            <Image src={logo} alt="logo" className="size-16 mb-4" />
            <h1 className="font-sans font-semibold text-2xl">Welcome!</h1>
            <p className="text-sm font-semibold text-[#1C274C] mt-2">
              Signup to your account
            </p>
          </div>
          <hr className="my-4 border-[rgba(0,0,0,0.35)]" />
          <div className="space-y-4 px-6">
            <div>
              <label className="font-sans text-sm font-semibold text-[#1C274C]">
                Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 focus:outline-none focus:border-black transition"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>
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
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-[rgba(0,0,0,0.35)] rounded-md px-4 py-2 focus:outline-none focus:border-black transition"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
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
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
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
            <span>Already have an account? </span>
            <Link href="/auth/login" className="text-[#6BDE23] ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
      <footer className="border-t border-[rgba(0,0,0,0.35)] h-12 text-[#1C274C] flex items-center justify-center text-sm">
        &copy; 2023 GrowthX. All Rights Reserved. Designed, Built &amp; Maintained by Sid*
      </footer>
    </div>
  );
};

export default SignupPage;