"use client";

import React, { useState } from "react";
import {
	useGetServiceRequestsQuery,
	useUpdateServiceRequestMutation,
} from "@/lib/redux/api/serviceRequestApi";
import { toast } from "react-hot-toast";
import { Star, MapPin, Car } from "lucide-react";

export default function ServiceRequestTable() {
	const { data, isLoading, isError, refetch } = useGetServiceRequestsQuery();
	const [updateServiceRequest] = useUpdateServiceRequestMutation();
	const requests = Array.isArray(data) ? data : data?.data ?? [];
	const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

	const handleRatingSubmit = async (requestId: number, rating: number) => {
		setIsUpdating((prev) => ({ ...prev, [requestId]: true }));
		try {
			await updateServiceRequest({ id: requestId, data: { rating } }).unwrap();
			toast.success("Rating submitted successfully!");
			refetch();
		} catch (error: any) {
			toast.error(error?.data?.message || "Failed to submit rating. Please try again.");
		} finally {
			setIsUpdating((prev) => ({ ...prev, [requestId]: false }));
		}
	};

	const renderStars = (request: any, isEditable: boolean = false) => {
		const currentRating = request.rating || 0;
		return (
			<div className="flex items-center gap-1">
				{[...Array(5)].map((_, i) => (
					<Star
						key={i}
						size={16}
						className={`cursor-pointer transition-colors ${
							isEditable && i < 5
								? "hover:text-yellow-400"
								: i < currentRating
								? "text-yellow-400 fill-yellow-400"
								: "text-gray-300"
						} ${isUpdating[request.id] ? "cursor-not-allowed opacity-50" : ""}`}
						fill={i < currentRating ? "currentColor" : "none"}
						onClick={
							isEditable && !isUpdating[request.id]
								? () => handleRatingSubmit(request.id, i + 1)
								: undefined
						}
					/>
				))}
				{currentRating > 0 && (
					<span className="ml-1 text-xs sm:text-sm font-medium text-gray-900">
						{currentRating}/5
					</span>
				)}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="bg-white border rounded-xl shadow-lg p-8 text-center">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center">
				<p className="text-red-500 font-medium">Failed to load service requests.</p>
				<button
					onClick={() => refetch()}
					className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="bg-white border rounded-xl shadow-lg p-4 sm:p-6">
			<h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Service Request History</h3>
			{requests?.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-sm sm:text-base text-gray-500">No service requests found.</p>
					<p className="text-xs sm:text-sm text-gray-400 mt-2">
						Your service history will appear here once you make a request.
					</p>
				</div>
			) : (
				<>
					{/* Desktop Table View */}
					<div className="hidden lg:block overflow-x-auto">
						<table className="w-full border-collapse rounded-lg overflow-hidden">
							<thead>
								<tr className="bg-gray-100 text-gray-700 text-sm">
									<th className="p-3 text-left font-semibold">
										Issue Description
									</th>
									<th className="p-3 text-left font-semibold">Status</th>
									<th className="p-3 text-left font-semibold">Vehicle</th>
									<th className="p-3 text-left font-semibold">Location</th>
									<th className="p-3 text-left font-semibold">Rating</th>
									<th className="p-3 text-left font-semibold">Requested At</th>
								</tr>
							</thead>
							<tbody>
								{requests?.map((request, index) => (
									<tr
										key={request.id}
										className={`text-sm ${
											index % 2 === 0 ? "bg-white" : "bg-gray-50"
										} hover:bg-gray-100 transition`}
									>
										<td className="p-3 font-medium text-gray-900 max-w-xs">
											<div className="line-clamp-2">
												{request.issue_description || "N/A"}
											</div>
										</td>
										<td className="p-3">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
													request.status === "completed"
														? "bg-green-100 text-green-700"
														: request.status === "in_progress"
														? "bg-blue-100 text-blue-700"
														: request.status === "pending"
														? "bg-yellow-100 text-yellow-700"
														: request.status === "canceled"
														? "bg-red-100 text-red-700"
														: "bg-gray-200 text-gray-700"
												}`}
											>
												{request.status.replace("_", " ")}
											</span>
										</td>
										<td className="p-3 text-gray-900 text-sm">
											<div className="flex items-center gap-2">
												<Car size={16} className="text-gray-500" />
												<span>
													{request.car_make} {request.car_model}{" "}
													{request.car_year}
												</span>
											</div>
										</td>
										<td className="p-3 text-gray-500 text-sm max-w-xs">
											<div className="flex items-start gap-1">
												<MapPin
													size={14}
													className="text-gray-400 mt-0.5 flex-shrink-0"
												/>
												<span className="line-clamp-2">
													{request.service_location || "N/A"}
												</span>
											</div>
										</td>
										<td className="p-3">
											{request.status === "completed"
												? renderStars(request, !request.rating)
												: renderStars(request)}
										</td>
										<td className="p-3 text-gray-500 text-sm whitespace-nowrap">
											{new Date(request.requested_at).toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Mobile/Tablet Card View */}
					<div className="lg:hidden space-y-4">
						{requests?.map((request) => (
							<div
								key={request.id}
								className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-3">
									<h4 className="font-semibold text-gray-900 text-sm sm:text-base flex-1 mr-2">
										{request.issue_description || "N/A"}
									</h4>
									<span
										className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
											request.status === "completed"
												? "bg-green-100 text-green-700"
												: request.status === "in_progress"
												? "bg-blue-100 text-blue-700"
												: request.status === "pending"
												? "bg-yellow-100 text-yellow-700"
												: request.status === "canceled"
												? "bg-red-100 text-red-700"
												: "bg-gray-200 text-gray-700"
										}`}
									>
										{request.status.replace("_", " ")}
									</span>
								</div>

								<div className="space-y-2 text-xs sm:text-sm">
									<div className="flex items-center gap-2">
										<Car size={16} className="text-gray-500" />
										<span className="text-gray-900 font-medium">
											{request.car_make} {request.car_model}{" "}
											{request.car_year}
										</span>
									</div>

									<div className="flex items-start gap-2">
										<MapPin
											size={16}
											className="text-gray-500 flex-shrink-0 mt-0.5"
										/>
										<span className="text-gray-900 font-medium">
											{request.service_location || "N/A"}
										</span>
									</div>

									<div className="flex justify-between items-center pt-2 border-t border-gray-200">
										<span className="text-gray-600">Rating:</span>
										<div>
											{request.status === "completed" ? (
												renderStars(request, !request.rating)
											) : (
												<span className="text-xs text-gray-400">
													Not completed
												</span>
											)}
										</div>
									</div>

									<div className="flex justify-between pt-2 border-t border-gray-200">
										<span className="text-gray-600">Requested:</span>
										<span className="text-gray-900 font-medium">
											{new Date(request.requested_at).toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
