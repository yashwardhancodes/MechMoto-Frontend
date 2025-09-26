"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUpdateAddressMutation, useGetAddressesQuery } from "@/lib/redux/api/partApi";


interface Address {
  id: number;
  label?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
}


export default function EditAddress() {
	const { id } = useParams();
	const router = useRouter();
	const [form, setForm] = useState({
		label: "",
		fullName: "",
		mobile: "",
		email: "",
		house: "",
		area: "",
		city: "",
		state: "",
		landmark: "",
		pincode: "",
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { data: addressesData } = useGetAddressesQuery(undefined);
	const [updateAddress, { isLoading }] = useUpdateAddressMutation();

	useEffect(() => {
		if (addressesData) {
			const address = addressesData.data.find(
				(addr: Address) => addr.id === parseInt(id as string),
			);
			if (address) {
				const [house, area, landmark] = address.address_line1
					? address.address_line1.split(", ")
					: ["", "", ""];
				setForm({
					label: address.label || "",
					fullName: address.fullName || "",
					mobile: address.mobile || "",
					email: address.email || "",
					house: house || "",
					area: area || "",
					city: address.city || "",
					state: address.state || "",
					landmark: landmark || "",
					pincode: address.zip || "",
				});
			}
		}
	}, [addressesData, id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const addressData = {
				id: parseInt(id as string),
				label: form.label || "Custom",
				address_line1: `${form.house}, ${form.area}, ${form.landmark}`,
				address_line2: "",
				city: form.city,
				state: form.state,
				zip: form.pincode,
				country: "India",
			};
			await updateAddress(addressData).unwrap();
			router.push("/products/cart/select-address");
		} catch  {
			setErrorMessage("Failed to update address. Please try again.");
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
						{isLoading ? "Updating..." : "Update"}
					</button>
				</div>
			</form>
		</div>
	);
}
