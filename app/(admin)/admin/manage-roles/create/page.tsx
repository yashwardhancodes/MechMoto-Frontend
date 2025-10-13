// src/app/roles/create/page.tsx
"use client";

import { useState } from "react";
import { useCreateRoleMutation } from "@/lib/redux/api/rolesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateRolePage() {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		is_system: false,
	});
	const [createRole] = useCreateRoleMutation();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const newRole = await createRole(formData).unwrap();
			router.push(`/admin/manage-roles/edit/${newRole.id}`);
		} catch (error) {
			console.error("Failed to create role:", error);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const { name } = target;

		if (target.type === "checkbox") {
			const inputTarget = target as HTMLInputElement;
			setFormData((prev) => ({
				...prev,
				[name]: inputTarget.checked,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: target.value,
			}));
		}
	};

	return (
		<div className="container mx-auto p-6 max-w-md">
			<h1 className="text-2xl font-bold mb-6">Create New Role</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
						Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={formData.name}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Description
					</label>
					<textarea
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
				<div className="flex items-center">
					<input
						id="is_system"
						name="is_system"
						type="checkbox"
						checked={formData.is_system}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, is_system: e.target.checked }))
						}
						className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
					/>
					<label htmlFor="is_system" className="ml-2 block text-sm text-gray-900">
						System Role
					</label>
				</div>
				<div className="flex space-x-3">
					<button
						type="submit"
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						Create Role
					</button>
					<Link href="/admin/manage-roles">
						<button
							type="button"
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
						>
							Cancel
						</button>
					</Link>
				</div>
			</form>
		</div>
	);
}
