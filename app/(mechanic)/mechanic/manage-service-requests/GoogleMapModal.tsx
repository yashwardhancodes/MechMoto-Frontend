"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
	request: any;
	onClose: () => void;
	center: { lat: number; lng: number };
	viewType?: "service_center" | "mechanic";
}

export default function GoogleMapModal({
	request,
	onClose,
	center,
	viewType = "service_center",
}: Props) {
	const mapRef = useRef<HTMLDivElement>(null);
	const [distance, setDistance] = useState<string>("");
	const [duration, setDuration] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	const isMechanicView = viewType === "mechanic";
	const markerLabel = isMechanicView ? "M" : "S";
	const markerTitle = isMechanicView ? "Your Location" : "Your Service Center";
	const legendText = isMechanicView ? "Your Location" : "Your Service Center";

	useEffect(() => {
		const loader = new Loader({
			apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
			version: "weekly",
		});

		loader.load().then(async (google) => {
			const map = new google.maps.Map(mapRef.current!, {
				center: { lat: request.latitude, lng: request.longitude },
				zoom: 12,
				styles: [
					{
						featureType: "poi",
						elementType: "labels",
						stylers: [{ visibility: "off" }],
					},
				],
			});

			// User Location Marker
			new google.maps.Marker({
				position: { lat: request.latitude, lng: request.longitude },
				map,
				title: "Customer Location",
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 12,
					fillColor: "#EF4444",
					fillOpacity: 1,
					strokeColor: "#ffffff",
					strokeWeight: 3,
				},
				label: {
					text: "C",
					color: "white",
					fontSize: "12px",
					fontWeight: "bold",
				},
			});

			// Mechanic/Service Center Location Marker
			new google.maps.Marker({
				position: { lat: center.lat, lng: center.lng },
				map,
				title: markerTitle,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 12,
					fillColor: "rgba(154,225,68,1)",
					fillOpacity: 1,
					strokeColor: "#ffffff",
					strokeWeight: 3,
				},
				label: {
					text: markerLabel,
					color: "white",
					fontSize: "12px",
					fontWeight: "bold",
				},
			});

			// Directions
			const directionsService = new google.maps.DirectionsService();
			const directionsRenderer = new google.maps.DirectionsRenderer({
				map,
				suppressMarkers: true,
				polylineOptions: {
					strokeColor: "rgba(154,225,68,0.8)",
					strokeWeight: 5,
				},
			});

			directionsService.route(
				{
					origin: { lat: center.lat, lng: center.lng },
					destination: { lat: request.latitude, lng: request.longitude },
					travelMode: google.maps.TravelMode.DRIVING,
				},
				(result, status) => {
					setIsLoading(false);
					if (status === "OK" && result) {
						directionsRenderer.setDirections(result);
						const route = result.routes[0].legs[0];
						setDistance(route.distance?.text || "");
						setDuration(route.duration?.text || "");
					}
				},
			);
		});
	}, [request, center, viewType]);

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
			<div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="bg-gradient-to-r from-[rgba(154,225,68,0.8)] to-[rgba(154,225,68,0.6)] p-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-white mb-2">
								Service Request Details
							</h2>
							<p className="text-white/90 text-sm">
								Review location and route information
							</p>
						</div>
						<button
							onClick={onClose}
							className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors ml-4 flex-shrink-0"
						>
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Request Info Cards */}
					<div className="grid md:grid-cols-3 gap-4 mb-6">
						{/* Issue Description */}
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
							<div className="flex items-center gap-2 mb-2">
								<svg
									className="w-5 h-5 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<h3 className="font-semibold text-blue-900">Issue</h3>
							</div>
							<p className="text-sm text-blue-800 line-clamp-2">
								{request.issue_description}
							</p>
						</div>

						{/* Distance */}
						<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
							<div className="flex items-center gap-2 mb-2">
								<svg
									className="w-5 h-5 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<h3 className="font-semibold text-purple-900">Distance</h3>
							</div>
							<p className="text-2xl font-bold text-purple-800">
								{isLoading ? "..." : distance || "N/A"}
							</p>
						</div>

						{/* Duration */}
						<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
							<div className="flex items-center gap-2 mb-2">
								<svg
									className="w-5 h-5 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<h3 className="font-semibold text-green-900">ETA</h3>
							</div>
							<p className="text-2xl font-bold text-green-800">
								{isLoading ? "..." : duration || "N/A"}
							</p>
						</div>
					</div>

					{/* Vehicle & Customer Info */}
					<div className="grid md:grid-cols-2 gap-4 mb-6">
						<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
										d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
									/>
								</svg>
								Vehicle Details
							</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Make & Model:</span>
									<span className="font-medium text-gray-800">
										{request.car_make} {request.car_model}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Year:</span>
									<span className="font-medium text-gray-800">
										{request.car_year}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Registration:</span>
									<span className="font-mono font-medium text-gray-800 bg-white px-2 py-1 rounded border border-gray-300">
										{request.reg_number}
									</span>
								</div>
							</div>
						</div>

						<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
								Customer Information
							</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Name:</span>
									<span className="font-medium text-gray-800">
										{request.user.profiles?.full_name}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Email:</span>
									<a
										href={`mailto:${request.user.email}`}
										className="font-medium text-[rgba(154,225,68,0.9)] hover:underline text-right break-all"
									>
										{request.user.email}
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Map */}
					<div className="relative rounded-xl overflow-hidden border-4 border-gray-100 shadow-lg">
						{isLoading && (
							<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
								<div className="text-center">
									<div className="w-12 h-12 border-4 border-[rgba(154,225,68,0.3)] border-t-[rgba(154,225,68,0.8)] rounded-full animate-spin mx-auto mb-3"></div>
									<p className="text-gray-600 font-medium">Loading route...</p>
								</div>
							</div>
						)}
						<div ref={mapRef} className="w-full h-[400px] md:h-[500px]" />
					</div>

					{/* Map Legend */}
					<div className="mt-4 flex flex-wrap gap-4 justify-center">
						<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
							<div className="w-6 h-6 rounded-full bg-[rgba(154,225,68,1)] border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
								{markerLabel}
							</div>
							<span className="text-sm font-medium text-gray-700">{legendText}</span>
						</div>
						<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
							<div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
								C
							</div>
							<span className="text-sm font-medium text-gray-700">
								Customer Location
							</span>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t border-gray-200 p-6 bg-gray-50">
					<div className="flex flex-col sm:flex-row gap-3 justify-end">
						<button
							onClick={onClose}
							className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-xl border-2 border-gray-200 transition-colors"
						>
							Close
						</button>
						<button
							onClick={() => {
								const url = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${request.latitude},${request.longitude}`;
								window.open(url, "_blank");
							}}
							className="px-6 py-3 bg-[rgba(154,225,68,0.8)] hover:bg-[rgba(154,225,68,1)] text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
							Open in Google Maps
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
