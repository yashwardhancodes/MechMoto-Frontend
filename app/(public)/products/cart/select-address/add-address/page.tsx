"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAddressMutation } from "@/lib/redux/api/partApi";

export default function AddAddress() {
	const router = useRouter();
	const [form, setForm] = useState({
		label: "",
		fullName: "",
		mobile: "",
		email: "",
		house: "",
		area: "",
		city: "", // Added city
		state: "",
		landmark: "",
		pincode: "",
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [createAddress, { isLoading }] = useCreateAddressMutation();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const addressData = {
				label: form.label || "Custom",
				address_line1: `${form.house}, ${form.area}, ${form.landmark}`,
				address_line2: "",
				city: form.city,
				state: form.state,
				zip: form.pincode,
				country: "India",
			};
			await createAddress(addressData).unwrap();
			router.push("/products/cart/select-address");
		} catch (err) {
			setErrorMessage("Failed to add address. Please try again.");
		}
	};

	return (
		<div className="bg-white px-3 md:px-16 lg:px-24 font-sans">
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					name="label"
					placeholder="Label (e.g., Home, Office)"
					value={form.label}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="fullName"
					placeholder="Full Name"
					value={form.fullName}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="mobile"
					placeholder="Mobile Number"
					value={form.mobile}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={form.email}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="house"
					placeholder="Flat No/ House"
					value={form.house}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="area"
					placeholder="Area"
					value={form.area}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="city"
					placeholder="City"
					value={form.city}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="state"
					placeholder="State"
					value={form.state}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="landmark"
					placeholder="Landmark"
					value={form.landmark}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>
				<input
					type="text"
					name="pincode"
					placeholder="Pincode"
					value={form.pincode}
					onChange={handleChange}
					className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
				/>

				{errorMessage && <p className="text-red-600">{errorMessage}</p>}

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isLoading}
						className="bg-[#9AE144] text-black font-semibold px-10 py-3 rounded-full hover:bg-[#3A7813] transition-colors"
					>
						{isLoading ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</div>
	);
}
