// frontend/app/admin/dashboard/manage-users/editUser/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserQuery, useUpdateUserMutation } from "@/lib/redux/api/userApi";
import { useGetRolesQuery } from "@/lib/redux/api/rolesApi";
import { toast } from "react-hot-toast";
import { z } from "zod";

interface FormData {
	fullName: string;
	email: string;
	phone: string;
	roleName: string;
	// Vendor / ServiceCenter
	shop_name?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	// Mechanic
	latitude?: number;
	longitude?: number;
	isActive?: boolean;
	isAvailable?: boolean;
}

const EditUser: React.FC = () => {
	const { id } = useParams(); // id from dynamic route [id]
	const router = useRouter();

	const {
		data: userResp,
		isLoading: userLoading,
		error: userError,
	} = useGetUserQuery(id as string);

    const userData = userResp?.data;

	const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery({});
	const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

	const [formData, setFormData] = useState<FormData>({
		fullName: "",
		email: "",
		phone: "",
		roleName: "",
		shop_name: "",
		address: "",
		city: "",
		state: "",
		zip: "",
		country: "",
		latitude: 0,
		longitude: 0,
		isActive: true,
		isAvailable: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Dropdown states
	const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
	const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
	const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
	const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

	const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal"];
	const cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"];
	const countries = ["India"];

	const roles = rolesData || [];

	// Populate form when user data loads
	useEffect(() => {
		if (userData) {
			const user = userData; // assuming getUser returns the full user object

			setFormData({
				fullName: user.profiles?.full_name || "",
				email: user.email || "",
				phone: user.profiles?.phone || "",
				roleName: user.role?.name || "",
				// Vendor / ServiceCenter fields
				shop_name: user.vendors?.shop_name || user.service_centers?.name || "",
				address: user.vendors?.address || user.service_centers?.address || "",
				city:
					user.vendors?.city || user.service_centers?.city || user.mechanics?.city || "",
				state: user.vendors?.state || user.service_centers?.state || "",
				zip: user.vendors?.zip || user.service_centers?.zip || "",
				country: user.vendors?.country || user.service_centers?.country || "India",
				// Mechanic fields
				latitude: user.mechanics?.latitude || 0,
				longitude: user.mechanics?.longitude || 0,
				isActive: user.vendors?.is_active ?? user.service_centers?.is_active ?? true,
				isAvailable: user.mechanics?.is_available ?? true,
			});
		}
	}, [userData]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
	};

	const handleSelectChange = (field: keyof FormData, value: string | number | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Dynamic Zod schema (same logic as AddUser)
	const getValidationSchema = () => {
		const base = z.object({
			email: z.string().email("Invalid email address"),
			fullName: z.string().min(1, "Full name is required"),
			phone: z.string().min(10, "Phone number must be at least 10 digits"),
			roleName: z.string().min(1, "Role is required"),
		});

		if (formData.roleName === "Vendor" || formData.roleName === "ServiceCenter") {
			return base.extend({
				shop_name: z.string().min(1, "Shop name is required"),
				address: z.string().min(1, "Address is required"),
				city: z.string().min(1, "City is required"),
				state: z.string().min(1, "State is required"),
				zip: z.string().min(4, "ZIP code is required"),
			});
		} else if (formData.roleName === "Mechanic") {
			return base.extend({
				city: z.string().min(1, "City is required"),
				latitude: z.number().min(-90).max(90, "Invalid latitude"),
				longitude: z.number().min(-180).max(180, "Invalid longitude"),
			});
		}
		return base;
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			const schema = getValidationSchema();
			const parsedData = schema.parse(formData);

			await updateUser({ id: id as string, ...parsedData }).unwrap();

			toast.success("User updated successfully!");
			router.push("/admin/manage-users");
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => {
					formatted[String(e.path[0])] = e.message;
				});
				setErrors(formatted);
				toast.error("Please fix the errors below");
			} else {
				toast.error(err?.data?.message || "Failed to update user");
			}
		}
	};

	if (userLoading || rolesLoading) {
		return <div className="flex justify-center items-center h-screen">Loading...</div>;
	}

	if (userError || !userData) {
		return <div className="text-red-500 text-center">User not found</div>;
	}

	const selectedRole = roles.find((r: any) => r.name === formData.roleName);

	return (
		<div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-2xl font-bold mb-8">Edit User</h1>

				<div className="space-y-9">
					{/* Basic Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<input
								type="text"
								name="fullName"
								placeholder="Full Name"
								value={formData.fullName}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors.fullName && (
								<p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
							)}
						</div>

						<div>
							<input
								type="email"
								name="email"
								placeholder="Email"
								value={formData.email}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors.email && (
								<p className="text-red-500 text-sm mt-1">{errors.email}</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<input
								type="tel"
								name="phone"
								placeholder="Mobile number +91"
								value={formData.phone}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors.phone && (
								<p className="text-red-500 text-sm mt-1">{errors.phone}</p>
							)}
						</div>

						<div className="relative">
							<button
								type="button"
								onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
							>
								<span
									className={
										formData.roleName ? "text-gray-700" : "text-gray-400"
									}
								>
									{formData.roleName || "Select Role"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] transition-transform ${
										roleDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
							{roleDropdownOpen && (
								<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{roles.map((role: any) => (
										<button
											key={role.id}
											type="button"
											onClick={() => {
												handleSelectChange("roleName", role.name);
												setRoleDropdownOpen(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
										>
											{role.name}
										</button>
									))}
								</div>
							)}
							{errors.roleName && (
								<p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
							)}
						</div>
					</div>

					{/* Role-specific fields (same as AddUser) */}
					{selectedRole && (
						<>
							{(formData.roleName === "Vendor" ||
								formData.roleName === "ServiceCenter") && (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<input
												type="text"
												name="shop_name"
												placeholder="Shop Name"
												value={formData.shop_name}
												onChange={handleInputChange}
												className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
											/>
											{errors.shop_name && (
												<p className="text-red-500 text-sm mt-1">
													{errors.shop_name}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="md:col-span-2">
											<textarea
												name="address"
												placeholder="Address"
												rows={4}
												value={formData.address}
												onChange={handleInputChange}
												className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
											/>
											{errors.address && (
												<p className="text-red-500 text-sm mt-1">
													{errors.address}
												</p>
											)}
										</div>

										<div className="space-y-6">
											{/* Country */}
											<div className="relative">
												<button
													type="button"
													onClick={() =>
														setCountryDropdownOpen(!countryDropdownOpen)
													}
													className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
												>
													<span
														className={
															formData.country
																? "text-gray-700"
																: "text-gray-400"
														}
													>
														{formData.country || "Country"}
													</span>
													<ChevronDown
														className={`w-5 h-5 text-[#9AE144] transition-transform ${
															countryDropdownOpen ? "rotate-180" : ""
														}`}
													/>
												</button>
												{countryDropdownOpen && (
													<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10">
														{countries.map((c) => (
															<button
																key={c}
																type="button"
																onClick={() => {
																	handleSelectChange(
																		"country",
																		c,
																	);
																	setCountryDropdownOpen(false);
																}}
																className="w-full px-4 py-2 text-left hover:bg-gray-50"
															>
																{c}
															</button>
														))}
													</div>
												)}
											</div>

											{/* City */}
											<div className="relative">
												<button
													type="button"
													onClick={() =>
														setCityDropdownOpen(!cityDropdownOpen)
													}
													className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
												>
													<span
														className={
															formData.city
																? "text-gray-700"
																: "text-gray-400"
														}
													>
														{formData.city || "City"}
													</span>
													<ChevronDown
														className={`w-5 h-5 text-[#9AE144] transition-transform ${
															cityDropdownOpen ? "rotate-180" : ""
														}`}
													/>
												</button>
												{cityDropdownOpen && (
													<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#80805] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
														{cities.map((city) => (
															<button
																key={city}
																type="button"
																onClick={() => {
																	handleSelectChange(
																		"city",
																		city,
																	);
																	setCityDropdownOpen(false);
																}}
																className="w-full px-4 py-2 text-left hover:bg-gray-50"
															>
																{city}
															</button>
														))}
													</div>
												)}
												{errors.city && (
													<p className="text-red-500 text-sm mt-1">
														{errors.city}
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="relative">
											<button
												type="button"
												onClick={() =>
													setStateDropdownOpen(!stateDropdownOpen)
												}
												className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
											>
												<span
													className={
														formData.state
															? "text-gray-700"
															: "text-gray-400"
													}
												>
													{formData.state || "State"}
												</span>
												<ChevronDown
													className={`w-5 h-5 text-[#9AE144] transition-transform ${
														stateDropdownOpen ? "rotate-180" : ""
													}`}
												/>
											</button>
											{stateDropdownOpen && (
												<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10">
													{states.map((s) => (
														<button
															key={s}
															type="button"
															onClick={() => {
																handleSelectChange("state", s);
																setStateDropdownOpen(false);
															}}
															className="w-full px-4 py-2 text-left hover:bg-gray-50"
														>
															{s}
														</button>
													))}
												</div>
											)}
											{errors.state && (
												<p className="text-red-500 text-sm mt-1">
													{errors.state}
												</p>
											)}
										</div>

										<div>
											<input
												type="text"
												name="zip"
												placeholder="Pincode"
												value={formData.zip}
												onChange={handleInputChange}
												className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
											/>
											{errors.zip && (
												<p className="text-red-500 text-sm mt-1">
													{errors.zip}
												</p>
											)}
										</div>
									</div>
								</>
							)}

							{formData.roleName === "Mechanic" && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div>
										<input
											type="text"
											name="city"
											placeholder="City"
											value={formData.city}
											onChange={handleInputChange}
											className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
										/>
										{errors.city && (
											<p className="text-red-500 text-sm mt-1">
												{errors.city}
											</p>
										)}
									</div>
									<div>
										<input
											type="number"
											name="latitude"
											placeholder="Latitude"
											value={formData.latitude}
											onChange={handleNumberInputChange}
											step="any"
											className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
										/>
										{errors.latitude && (
											<p className="text-red-500 text-sm mt-1">
												{errors.latitude}
											</p>
										)}
									</div>
									<div>
										<input
											type="number"
											name="longitude"
											placeholder="Longitude"
											value={formData.longitude}
											onChange={handleNumberInputChange}
											step="any"
											className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
										/>
										{errors.longitude && (
											<p className="text-red-500 text-sm mt-1">
												{errors.longitude}
											</p>
										)}
									</div>
								</div>
							)}
						</>
					)}

					{/* Submit */}
					<div className="flex justify-end pt-6 gap-4">
						<button
							type="button"
							onClick={() => router.push("/admin/manage-users")}
							className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={updating}
							className="px-8 py-3 bg-[#9AE144] hover:bg-[#8cc93b] text-black font-medium rounded-lg transition disabled:opacity-50"
						>
							{updating ? "Updating..." : "Update User"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditUser;
