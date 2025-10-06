"use client";

import { useState } from "react";
import {
	useGetServiceRequestsQuery,
	useUpdateServiceRequestMutation,
} from "@/lib/redux/api/serviceRequestApi";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamic Google Map
const GoogleMapModal = dynamic(() => import("./GoogleMapModal"), { ssr: false });

export default function MechanicRequests() {
	const { user } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState(null);
	const { data, refetch, isLoading } = useGetServiceRequestsQuery();
	const [updateServiceRequest] = useUpdateServiceRequestMutation();
	const requests = data?.data ?? [];

	const mechanicRequests = requests.filter(
		(r) => !["completed", "canceled"].includes(r.status),
	);

	const handleStatusChange = async (requestId: number, status: string) => {
		try {
			await updateServiceRequest({
				id: requestId,
				data: {status},
			}).unwrap();
			toast.success("Status updated successfully!");
			refetch();
		} catch (err: any) {
			toast.error(err?.data?.message || "Failed to update status");
		}
	};

	const getStatusLabel = (status: string) => {
		return status
			.replace(/_/g, " ")
			.toUpperCase()
			.replace("ASSIGNED", "Assigned")
			.replace("IN PROGRESS", "In Progress");
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[rgba(154,225,68,0.3)] border-t-[rgba(154,225,68,0.8)] rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 font-medium">Loading requests...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-[rgba(154,225,68,0.8)]">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
								My Service Requests
							</h1>
							<p className="text-gray-600">
								Manage your assigned service requests and update status
							</p>
						</div>
						<div className="bg-[rgba(154,225,68,0.1)] px-6 py-3 rounded-xl border border-[rgba(154,225,68,0.3)]">
							<p className="text-sm text-gray-600 mb-1">Total Active</p>
							<p className="text-3xl font-bold text-[rgba(154,225,68,1)]">
								{mechanicRequests.length}
							</p>
						</div>
					</div>
				</div>

				{/* Requests List */}
				{mechanicRequests.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
						<div className="max-w-md mx-auto">
							<div className="w-24 h-24 bg-[rgba(154,225,68,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
								<svg
									className="w-12 h-12 text-[rgba(154,225,68,0.8)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-800 mb-2">
								All Caught Up!
							</h3>
							<p className="text-gray-600">
								No active service requests at the moment. New assignments will
								appear here.
							</p>
						</div>
					</div>
				) : (
					<div className="grid gap-6">
						{mechanicRequests.map((req: any) => (
							<div
								key={req.id}
								className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
							>
								<div className="p-6 sm:p-8">
									{/* Request Header */}
									<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
										<div className="flex-1">
											<div className="flex items-start gap-3 mb-4">
												<div className="w-12 h-12 bg-[rgba(154,225,68,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
													<svg
														className="w-6 h-6 text-[rgba(154,225,68,0.8)]"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 6v6m0 0v6m0-6h6m-6 0H6"
														/>
													</svg>
												</div>
												<div>
													<h3 className="text-xl font-bold text-gray-800 mb-2">
														{req.issue_description}
													</h3>
													<span
														className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
															req.status === "assigned"
																? "bg-blue-100 text-blue-800"
																: req.status === "in_progress"
																? "bg-yellow-100 text-yellow-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														{getStatusLabel(req.status)}
													</span>
												</div>
											</div>
										</div>
									</div>

									{/* Request Details Grid */}
									<div className="grid sm:grid-cols-2 gap-6 mb-6">
										{/* Vehicle Info */}
										<div className="bg-gray-50 rounded-xl p-4">
											<div className="flex items-center gap-2 mb-3">
												<svg
													className="w-5 h-5 text-[rgba(154,225,68,0.8)]"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
													/>
												</svg>
												<h4 className="font-semibold text-gray-800">
													Vehicle Details
												</h4>
											</div>
											<div className="space-y-2 text-sm">
												<p className="text-gray-700">
													<span className="font-medium">Model:</span>{" "}
													{req.car_make} {req.car_model}
												</p>
												<p className="text-gray-700">
													<span className="font-medium">Year:</span>{" "}
													{req.car_year}
												</p>
												<p className="text-gray-700">
													<span className="font-medium">
														Registration:
													</span>{" "}
													<span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
														{req.reg_number}
													</span>
												</p>
											</div>
										</div>

										{/* Customer Info */}
										<div className="bg-gray-50 rounded-xl p-4">
											<div className="flex items-center gap-2 mb-3">
												<svg
													className="w-5 h-5 text-[rgba(154,225,68,0.8)]"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
													/>
												</svg>
												<h4 className="font-semibold text-gray-800">
													Customer Info
												</h4>
											</div>
											<div className="space-y-2 text-sm">
												<p className="text-gray-700">
													<span className="font-medium">Name:</span>{" "}
													{req.user.profiles?.full_name}
												</p>
												<p className="text-gray-700">
													<span className="font-medium">Email:</span>{" "}
													<a
														href={`mailto:${req.user.email}`}
														className="text-[rgba(154,225,68,0.9)] hover:underline"
													>
														{req.user.email}
													</a>
												</p>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
										<button
											onClick={() => setSelectedRequest(req)}
											className="flex-1 sm:flex-initial px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
												/>
											</svg>
											View Location & Route
										</button>

										<div className="flex-1 flex flex-col sm:flex-row gap-3 items-center">
											<select
												value={req.status}
												onChange={(e) =>
													handleStatusChange(req.id, e.target.value)
												}
												className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[rgba(154,225,68,0.8)] focus:outline-none transition-colors"
											>
												<option value="assigned">Assigned</option>
												<option value="in_progress">In Progress</option>
												<option value="completed">Completed</option>
												<option value="canceled">Canceled</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Map Modal */}
			{selectedRequest && (
				<GoogleMapModal
					request={selectedRequest}
					onClose={() => setSelectedRequest(null)}
					center={{
						lat: selectedRequest.service_center?.latitude || 1,
						lng: selectedRequest.service_center?.longitude || 1,
					}}
					viewType="mechanic"
				/>
			)}
		</div>
	);
}
