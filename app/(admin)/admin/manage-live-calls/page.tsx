"use client";

import {
	Pencil,
	Eye,
	X,
	Phone,
	Mail,
	User,
	Calendar,
	Clock,
	MessageSquare,
	Star,
} from "lucide-react";
import {
	useGetLiveCallRequestsQuery,
	useUpdateLiveCallRequestMutation,
} from "@/lib/redux/api/liveCallApi";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useState } from "react";

export default function ManageLiveCalls() {
	const { user } = useAuth();
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetLiveCallRequestsQuery({ page, limit });
	const [updateLiveCallRequest, { isLoading: isUpdating }] = useUpdateLiveCallRequestMutation();
	const [showModal, setShowModal] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const requests = data?.data?.requests ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const columns: TableColumn[] = [
		{
			key: "issue_description",
			header: "Issue Description",
			render: (item) => item.issue_description || "N/A",
		},
		{
			key: "status",
			header: "Status",
			render: (item) => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						item.status === "completed"
							? "bg-green-100 text-green-700"
							: item.status === "scheduled"
							? "bg-blue-100 text-blue-700"
							: item.status === "canceled"
							? "bg-red-100 text-red-700"
							: "bg-gray-200 text-gray-700"
					}`}
				>
					{item.status.toUpperCase()}
				</span>
			),
		},
		{
			key: "scheduled_at",
			header: "Scheduled At",
			render: (item) =>
				item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : "N/A",
		},
		{
			key: "call_duration",
			header: "Call Duration",
			render: (item) => (item.call_duration ? `${item.call_duration} min` : "N/A"),
		},
		{
			key: "rating",
			header: "Rating",
			render: (item) => item.rating || "N/A",
		},
		{
			key: "created_at",
			header: "Created At",
			render: (item) => new Date(item.created_at).toLocaleDateString(),
		},
	];

	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (request) => {
				if (user?.role.name !== ROLES.SUPER_ADMIN) {
					toast.error("Only admins can edit call requests.");
					return;
				}
				setSelectedRequest({ ...request });
				setShowModal(true);
			},
			tooltip: "Edit call request",
		},
		{
			icon: Eye,
			onClick: (request) => {
				setSelectedRequest({ ...request });
				setShowModal(true);
			},
			tooltip: "View call request",
		},
	];

	const handleFieldChange = (field: string, value: any) => {
		setSelectedRequest((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateRequest = async (updateData: any) => {
		if (!selectedRequest?.id) return;
		try {
			await updateLiveCallRequest({
				id: selectedRequest.id,
				data: updateData,
			}).unwrap();
			toast.success("Call request updated successfully!");
			setShowModal(false);
			setSelectedRequest(null);
		} catch (error) {
			console.log("Error while updating call request: ", error);
			toast.error("Failed to update call request.");
		}
	};

	const handleSaveEdits = async () => {
		const original = requests.find((r: any) => r.id === selectedRequest.id);
		if (!original) return;

		const updateData: any = {};

		if (selectedRequest.status !== original.status) {
			updateData.status = selectedRequest.status;
		}
		if (selectedRequest.scheduled_at !== original.scheduled_at) {
			updateData.scheduled_at = selectedRequest.scheduled_at;
		}
		if (selectedRequest.call_duration !== original.call_duration) {
			updateData.call_duration = selectedRequest.call_duration;
		}
		if (selectedRequest.call_notes !== original.call_notes) {
			updateData.call_notes = selectedRequest.call_notes;
		}

		if (Object.keys(updateData).length === 0) {
			toast("No changes to save.");
			return;
		}

		await handleUpdateRequest(updateData);
	};

	const handleCloseModal = () => {
		if (isUpdating) return;
		setShowModal(false);
		setSelectedRequest(null);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "scheduled":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "canceled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	if (showModal && selectedRequest) {
		const isEditable = user?.role.name === ROLES.SUPER_ADMIN;
		const originalRequest = requests.find((r: any) => r.id === selectedRequest.id);

		const statusChanged = selectedRequest.status !== originalRequest?.status;
		const scheduledChanged = selectedRequest.scheduled_at !== originalRequest?.scheduled_at;
		const callDurationChanged =
			selectedRequest.call_duration !== originalRequest?.call_duration;
		const callNotesChanged = selectedRequest.call_notes !== originalRequest?.call_notes;
		const hasChanges =
			statusChanged ||
			(selectedRequest.status === "scheduled" && scheduledChanged) ||
			(selectedRequest.status === "completed" && (callDurationChanged || callNotesChanged));

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
				<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
					<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
						<h2 className="text-xl font-bold text-white">
							{isEditable ? "Edit" : "View"} Live Call Request Details
						</h2>
						<button
							onClick={handleCloseModal}
							disabled={isUpdating}
							className="text-white hover:bg-white/20 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<X size={24} />
						</button>
					</div>

					<div className="overflow-y-auto p-6 space-y-6">
						<div className="flex justify-center">
							<span
								className={`px-6 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
									selectedRequest.status,
								)}`}
							>
								{selectedRequest.status.toUpperCase()}
							</span>
						</div>

						<div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-4 flex items-center">
								<User size={20} className="mr-2 text-blue-600" />
								User Information
							</h3>
							<div className="space-y-3">
								<div className="flex items-start">
									<User size={16} className="mr-3 mt-0.5 text-gray-500" />
									<div>
										<p className="text-xs text-gray-500">Full Name</p>
										<p className="text-sm font-medium text-gray-900">
											{selectedRequest.user.profiles.full_name}
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<Mail size={16} className="mr-3 mt-0.5 text-gray-500" />
									<div>
										<p className="text-xs text-gray-500">Email</p>
										<p className="text-sm font-medium text-gray-900">
											{selectedRequest.user.email}
										</p>
									</div>
								</div>
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
									<div className="flex items-center">
										<Phone size={18} className="mr-2 text-yellow-700" />
										<div>
											<p className="text-xs text-yellow-700">Phone Number</p>
											<p className="font-semibold text-yellow-900">
												{selectedRequest.user.profiles.phone}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-4 flex items-center">
								<MessageSquare size={20} className="mr-2 text-blue-600" />
								Request Details
							</h3>
							<div className="space-y-4">
								<div>
									<p className="text-xs text-gray-500 mb-1">Issue Description</p>
									<p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
										{selectedRequest.issue_description ||
											"No description provided"}
									</p>
								</div>

								{selectedRequest.status === "scheduled" && (
									<div>
										<p className="text-xs text-gray-500 mb-1 flex items-center">
											<Calendar size={14} className="mr-1" />
											{isEditable ? "Edit " : ""}Scheduled At
										</p>
										{isEditable ? (
											<input
												type="datetime-local"
												value={
													selectedRequest.scheduled_at
														? new Date(selectedRequest.scheduled_at)
																.toISOString()
																.slice(0, 16)
														: ""
												}
												onChange={(e) =>
													handleFieldChange(
														"scheduled_at",
														e.target.value
															? new Date(e.target.value).toISOString()
															: null,
													)
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										) : (
											<p className="text-sm font-medium text-gray-900">
												{selectedRequest.scheduled_at
													? new Date(
															selectedRequest.scheduled_at,
													  ).toLocaleString()
													: "Not scheduled"}
											</p>
										)}
									</div>
								)}

								{selectedRequest.status === "completed" && (
									<>
										<div>
											<p className="text-xs text-gray-500 mb-1 flex items-center">
												<Clock size={14} className="mr-1" />
												{isEditable ? "Edit " : ""}Call Duration (minutes)
											</p>
											{isEditable ? (
												<input
													type="number"
													min={0}
													value={selectedRequest.call_duration || ""}
													onChange={(e) =>
														handleFieldChange(
															"call_duration",
															e.target.value
																? parseInt(e.target.value)
																: null,
														)
													}
													className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<p className="text-sm font-medium text-gray-900">
													{selectedRequest.call_duration
														? `${selectedRequest.call_duration} minutes`
														: "N/A"}
												</p>
											)}
										</div>

										<div>
											<p className="text-xs text-gray-500 mb-1">Call Notes</p>
											{isEditable ? (
												<textarea
													value={selectedRequest.call_notes || ""}
													onChange={(e) =>
														handleFieldChange(
															"call_notes",
															e.target.value || null,
														)
													}
													rows={3}
													className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
												/>
											) : (
												<p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
													{selectedRequest.call_notes ||
														"No notes provided"}
												</p>
											)}
										</div>
									</>
								)}

								{selectedRequest.rating && (
									<div>
										<p className="text-xs text-gray-500 mb-1 flex items-center">
											<Star size={14} className="mr-1" />
											Rating
										</p>
										<div className="flex items-center">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													size={18}
													className={
														i < selectedRequest.rating
															? "text-yellow-400 fill-yellow-400"
															: "text-gray-300"
													}
												/>
											))}
											<span className="ml-2 text-sm font-medium text-gray-900">
												{selectedRequest.rating}/5
											</span>
										</div>
									</div>
								)}

								<div>
									<p className="text-xs text-gray-500 mb-1">Created At</p>
									<p className="text-sm font-medium text-gray-900">
										{new Date(selectedRequest.created_at).toLocaleString()}
									</p>
								</div>
							</div>
						</div>

						{isEditable && (
							<div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
								<label className="block text-sm font-semibold text-gray-900 mb-3">
									Update Status
								</label>
								<select
									value={selectedRequest.status}
									onChange={(e) => {
										const newStatus = e.target.value;
										const updates: any = { status: newStatus };
										if (
											newStatus === "scheduled" &&
											!selectedRequest.scheduled_at
										) {
											updates.scheduled_at = new Date().toISOString();
										} else if (newStatus === "completed") {
											if (selectedRequest.call_duration == null) {
												updates.call_duration = 0;
											}
											if (!selectedRequest.call_notes) {
												updates.call_notes = "";
											}
										}
										setSelectedRequest((prev) => ({ ...prev, ...updates }));
									}}
									disabled={isUpdating}
									className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									<option value="requested">Requested</option>
									<option value="scheduled">Scheduled</option>
									<option value="completed">Completed</option>
									<option value="canceled">Canceled</option>
								</select>
							</div>
						)}

						{isEditable && hasChanges && (
							<div className="flex justify-end">
								<button
									onClick={handleSaveEdits}
									disabled={isUpdating}
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
								>
									{isUpdating ? "Saving..." : "Save Changes"}
								</button>
							</div>
						)}
					</div>

					<div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
						<button
							onClick={handleCloseModal}
							disabled={isUpdating}
							className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<DataTable
			title="Live Call Requests"
			data={requests}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			emptyMessage="No call requests found."
			errorMessage="Failed to load call requests."
			loadingMessage="Loading call requests..."
			pagination={
				totalPages > 0
					? {
							currentPage: page,
							totalPages,
							totalItems: total,
							pageSize: limit,
							onPageChange: setPage,
					  }
					: undefined
			}
		/>
	);
}
