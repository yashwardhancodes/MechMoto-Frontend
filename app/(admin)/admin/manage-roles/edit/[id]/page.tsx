// src/app/roles/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
	useGetRoleQuery,
	useUpdateRoleMutation,
	useDeleteRoleMutation,
} from "@/lib/redux/api/rolesApi";
import {
	useGetPermissionsByRoleQuery,
	useCreatePermissionMutation,
	useDeletePermissionMutation,
} from "@/lib/redux/api/permissionsApi";
import { useGetModulesQuery } from "@/lib/redux/api/moduleApi"; // Assuming moduleApi is in features/modules/api.ts
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ModulePermissions {
	[moduleId: number]: Set<string>;
}

const ACTIONS = ["create", "read", "update", "delete"] as const;

export default function EditRolePage() {
	const params = useParams();
	const id = parseInt(params.id as string);
	const router = useRouter();

	const { data: role, isLoading: loadingRole } = useGetRoleQuery(id);
	const { data: permissions = [] } = useGetPermissionsByRoleQuery(id);
	const { data: modules = [] } = useGetModulesQuery({});
	const [updateRole] = useUpdateRoleMutation();
	const [createPermission] = useCreatePermissionMutation();
	const [deletePermission] = useDeletePermissionMutation();
	const [deleteRoleMutation] = useDeleteRoleMutation();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		is_system: false,
	});
	const [modulePermissions, setModulePermissions] = useState<ModulePermissions>({});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (role) {
			setFormData({
				name: role.name,
				description: role.description || "",
				is_system: role.is_system,
			});
		}
	}, [role]);

	useEffect(() => {
		const perms: ModulePermissions = {};
		permissions.forEach((p) => {
			if (p.moduleId && p.action) {
				if (!perms[p.moduleId]) perms[p.moduleId] = new Set();
				perms[p.moduleId].add(p.action);
			}
		});
		setModulePermissions(perms);
	}, [permissions]);

	const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const name = target.name;
		const value = target.value;
		const type = (target as HTMLInputElement).type;
		const checked = (target as HTMLInputElement).checked;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const toggleAction = (moduleId: number, action: string, checked: boolean) => {
		setModulePermissions((prev) => {
			const newPerms = { ...prev };
			if (!newPerms[moduleId]) newPerms[moduleId] = new Set();
			if (checked) {
				newPerms[moduleId].add(action);
			} else {
				newPerms[moduleId].delete(action);
			}
			return newPerms;
		});
	};

	const handleSave = async () => {
		if (saving) return;
		setSaving(true);
		setError(null);

		try {
			// Update role
			if (
				role &&
				(formData.name !== role.name ||
					formData.description !== (role.description || "") ||
					formData.is_system !== role.is_system)
			) {
				await updateRole({ id, body: formData }).unwrap();
			}

			// Manage permissions: delete existing, create new
			const existingIds = permissions.map((p) => p.id);
			await Promise.all(existingIds.map((pid) => deletePermission(pid).unwrap()));

			const newPerms: any[] = [];
			Object.entries(modulePermissions).forEach(([modIdStr, actionsSet]) => {
				const moduleId = parseInt(modIdStr);
				actionsSet.forEach((action: string) => {
					if (action) {
						newPerms.push({ roleId: id, moduleId, action });
					}
				});
			});
			await Promise.all(newPerms.map((perm) => createPermission(perm).unwrap()));

			setError(null);
			// Optionally refetch or show success
		} catch (err) {
			setError("Failed to save changes. Please try again.");
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this role? This will also delete associated permissions.",
			)
		)
			return;
		try {
			await deleteRoleMutation(id).unwrap();
			router.push("/admin/manage-roles");
		} catch (error) {
			console.error("Failed to delete role:", error);
		}
	};

	if (loadingRole) return <div className="p-6">Loading role...</div>;

	if (!role) return <div className="p-6">Role not found</div>;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/admin/manage-roles">
						<button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							<span>Back to Roles</span>
						</button>
					</Link>
					<h1 className="text-2xl font-bold">Edit Role: {role.name}</h1>
				</div>
				{role.is_system && (
					<span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
						Protected System Role
					</span>
				)}
			</div>

			{error && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Role Details */}
				<div className="lg:col-span-1">
					<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
						<h2 className="text-xl font-semibold mb-4 text-gray-900">Role Details</h2>
						<div className="space-y-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									value={formData.name}
									onChange={handleRoleChange}
									disabled={role.is_system}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
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
									onChange={handleRoleChange}
									disabled={role.is_system}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 resize-none"
								/>
							</div>
							<div className="flex items-center space-x-2">
								<input
									id="is_system"
									name="is_system"
									type="checkbox"
									checked={formData.is_system}
									onChange={handleRoleChange}
									disabled={true}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
								/>
								<label
									htmlFor="is_system"
									className="text-sm font-medium text-gray-900"
								>
									System Role
								</label>
							</div>
						</div>
					</div>
				</div>

				{/* Permissions */}
				<div className="lg:col-span-2">
					<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
						<h2 className="text-xl font-semibold mb-4 text-gray-900">Permissions</h2>
						<p className="text-sm text-gray-600 mb-6">
							Select actions for each module. Permissions define what users with this
							role can do.
						</p>
						<div className="space-y-6 max-h-96 overflow-y-auto">
							{modules.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									No modules available.
								</p>
							) : (
								modules.map((module) => {
									const currentActions =
										modulePermissions[module.id] || new Set();
									return (
										<div
											key={module.id}
											className="border-b border-gray-200 pb-6 last:border-b-0"
										>
											<div className="flex justify-between items-start mb-4">
												<div>
													<h3 className="text-lg font-medium text-gray-900">
														{module.name}
													</h3>
													{module.description && (
														<p className="text-sm text-gray-500 mt-1">
															{module.description}
														</p>
													)}
												</div>
												<span className="text-sm text-gray-500">
													{currentActions.size} actions selected
												</span>
											</div>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												{ACTIONS.map((action) => (
													<label
														key={action}
														className="flex items-center space-x-2 cursor-pointer"
													>
														<input
															type="checkbox"
															checked={currentActions.has(action)}
															onChange={(e) =>
																toggleAction(
																	module.id,
																	action,
																	e.target.checked,
																)
															}
															disabled={role.is_system}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
														/>
														<span className="text-sm font-medium text-gray-900 capitalize">
															{action}
														</span>
													</label>
												))}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 justify-end">
				<button
					onClick={handleSave}
					disabled={saving || role.is_system}
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
				>
					{saving ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span>Saving...</span>
						</>
					) : (
						<>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							<span>Save Changes</span>
						</>
					)}
				</button>
				{!role.is_system && (
					<button
						onClick={handleDelete}
						className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						<svg
							className="w-4 h-4 inline mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Delete Role
					</button>
				)}
			</div>
		</div>
	);
}
