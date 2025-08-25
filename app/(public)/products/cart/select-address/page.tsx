"use client";

import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSelectedAddress } from "@/lib/redux/slices/checkoutSlice";
import { useGetAddressesQuery, useDeleteAddressMutation } from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";

export default function SelectAddress() {
	const { isLoggedIn } = useAuth();
	const router = useRouter();
	const dispatch = useDispatch();
	const [selected, setSelected] = useState<number | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

	const {
		data: addressesData,
		isLoading,
		error,
	} = useGetAddressesQuery(undefined, { skip: !isLoggedIn });
	const [deleteAddress] = useDeleteAddressMutation();

	const addresses = addressesData?.data || [];

	const handleSelect = (id: number) => {
		setSelected(id);
		dispatch(setSelectedAddress(id));
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteAddress(id).unwrap();
			setShowConfirmDelete(null);
			if (selected === id) setSelected(null);
		} catch (err) {
			setErrorMessage("Failed to delete address.");
		}
	};

	if (isLoading) return <div className="p-6">Loading addresses...</div>;
	if (error) return <div className="p-6 text-red-600">Failed to load addresses.</div>;

	return (
		<div className="font-sans bg-white md:px-6 text-[#1E1E1E]">
			<div className="flex items-center md:pb-6 gap-2 mb-2">
				<h2 className="text-[20px] md:text-[28px] lg:text-[30px] font-semibold">
					Select an Address
				</h2>
			</div>
			<p className="text-[#9AE144] mb-6 text-xs md:text-base">Select to get fast delivery</p>

			{errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

			<h3 className="text-lg sm:text-xl font-semibold mb-4">My Addresses</h3>

			<div className="space-y-4">
				{addresses.map((item: any) => (
					<div
						key={item.id}
						onClick={() => handleSelect(item.id)}
						className="flex items-center justify-between border border-gray-200 rounded-xl p-2 md:p-4 cursor-pointer hover:shadow-sm transition"
					>
						<div className="flex items-center gap-3">
							<div
								className={`size-4 md:size-6 rounded-full border-2 flex items-center justify-center 
                ${selected === item.id ? "border-[#9AE144]" : "border-gray-300"}`}
							>
								{selected === item.id && (
									<div className="size-1 md:size-3 rounded-full bg-[#9AE144]" />
								)}
							</div>

							<div>
								<p className="font-semibold text-sm md:text-base">{item.label}</p>
								<p className="text-gray-500 text-xs md:text-base">
									{item.address_line1}, {item.city}, {item.state} {item.zip}
								</p>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								onClick={(e) => {
									e.stopPropagation();
									router.push(
										`/products/cart/select-address/edit-address/${item.id}`,
									);
								}}
								className="flex items-center gap-1 text-[#9AE144] text-xs sm:text-sm font-medium"
							>
								<FiEdit className="w-4 h-4" /> Edit
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowConfirmDelete(item.id);
								}}
								className="flex items-center gap-1 text-red-600 text-xs sm:text-sm font-medium"
							>
								<FiTrash2 className="w-4 h-4" /> Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{showConfirmDelete && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white p-6 rounded-lg">
						<p>Are you sure you want to delete this address?</p>
						<div className="flex justify-end gap-4 mt-4">
							<button
								onClick={() => setShowConfirmDelete(null)}
								className="text-gray-600"
							>
								Cancel
							</button>
							<button
								onClick={() => handleDelete(showConfirmDelete)}
								className="text-red-600"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="mt-8 flex items-center justify-between">
				<button
					onClick={() => router.push("/products/cart/select-address/add-address")}
					className="flex items-center gap-1 text-[#9AE144] font-medium text-sm sm:text-base"
				>
					<span className="text-lg sm:text-xl">+</span> Add address
				</button>

				<button
					disabled={!selected}
					onClick={() => router.push("/products/cart/select-address/checkout")}
					className={`px-2 md:px-4 text-xs md:text-base py-2 rounded-full text-black font-semibold transition 
            ${selected ? "bg-[#9AE144] hover:bg-[#89CC33]" : "bg-[#89CC33] cursor-not-allowed"}`}
				>
					Proceed to Checkout
				</button>
			</div>
		</div>
	);
}
