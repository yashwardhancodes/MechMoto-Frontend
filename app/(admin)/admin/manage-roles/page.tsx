// src/app/roles/page.tsx (Assuming Next.js app directory)
"use client";

import { useState } from "react";
import { useGetRolesQuery, useDeleteRoleMutation } from "@/lib/redux/api/rolesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RolesPage() {
	const { data: roles = [], isLoading } = useGetRolesQuery({});
	const [deleteRole] = useDeleteRoleMutation();
	const router = useRouter();
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const handleDelete = async (id: number) => {
		setDeletingId(id);
		try {
			await deleteRole(id).unwrap();
		} catch (error) {
			console.error("Failed to delete role:", error);
		} finally {
			setDeletingId(null);
		}
	};

	if (isLoading) return <div className="p-6">Loading roles...</div>;

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Roles</h1>
				<Link
					href="/admin/manage-roles/create"
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Create Role
				</Link>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white border border-gray-200">
					<thead>
						<tr className="bg-gray-50">
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Description
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								System Role
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Created At
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{roles.map((role) => (
							<tr key={role.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{role.name}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{role.description || "-"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{role.is_system ? "Yes" : "No"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(role.created_at).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={(e) => {
												e.preventDefault();
												router.push(`/admin/manage-roles/edit/${role.id}`);
											}}
											className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
										>
											Edit
										</button>
										{!role.is_system && (
											<button
												onClick={() => handleDelete(role.id)}
												disabled={deletingId === role.id}
												className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs disabled:opacity-50"
											>
												{deletingId === role.id ? "Deleting..." : "Delete"}
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
