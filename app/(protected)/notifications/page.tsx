// NotificationsPage.tsx (unchanged)
"use client";
import React, { useState } from "react";
import { Bell, Check, Trash2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/lib/redux/api/notificationApi";

type FilterType = "all" | "unread" | "read";

const NotificationsPage: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>("unread");
	const [currentPage, setCurrentPage] = useState(1);
	const limit = 20;

	// ✅ Directly get all data from hook
	const {
		notifications,
		unreadNotifications,
		unreadCount,
		total,
		isLoading,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		refetch,
	} = useNotifications({ limit, offset: (currentPage - 1) * limit });

	// ✅ Use client-side filtering instead of passing filter to hook
	let filteredNotifications: Notification[] = [];
	switch (filter) {
		case "unread":
			filteredNotifications = unreadNotifications;
			break;
		case "read":
			filteredNotifications = notifications.filter((n) => n.is_read);
			break;
		case "all":
		default:
			filteredNotifications = notifications;
			break;
	}

	const totalPages = Math.ceil(total / limit);

	const handleMarkAsRead = (id: string) => markAsRead(id);
	const handleMarkAllAsRead = () => {
		if (confirm("Mark all notifications as read?")) markAllAsRead();
	};
	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this notification?")) deleteNotification(id);
	};

	const formatTime = (date: string | Date) => {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return new Date(date).toLocaleDateString();
	};

	const getNotificationIcon = (type?: string) => {
		switch (type) {
			case "message":
				return "💬";
			case "payment":
				return "💳";
			case "system":
				return "⚙️";
			case "alert":
				return "⚠️";
			default:
				return "📢";
		}
	};

	// Manual refetch on filter change to ensure consistency
	React.useEffect(() => {
		refetch();
	}, [filter, refetch]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 mt-16">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
						<p className="mt-2 text-base text-gray-600">
							You have{" "}
							<span className="font-semibold text-blue-600">{unreadCount}</span>{" "}
							unread {unreadCount === 1 ? "notification" : "notifications"}
						</p>
					</div>
					<button
						onClick={handleMarkAllAsRead}
						disabled={unreadCount === 0}
						className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 shadow-sm hover:shadow-md"
					>
						<CheckCircle2 className="w-5 h-5" />
						Mark All as Read
					</button>
				</div>

				{/* Filter Tabs */}
				<div className="mb-6 flex gap-2">
					{(["unread", "all", "read"] as FilterType[]).map((tab) => (
						<button
							key={tab}
							onClick={() => {
								setFilter(tab);
								setCurrentPage(1);
							}}
							className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
								filter === tab
									? "bg-blue-600 text-white shadow-md"
									: "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
							}`}
						>
							{tab === "unread"
								? `Unread (${unreadCount})`
								: tab === "read"
								? "Read"
								: "All"}
						</button>
					))}
				</div>

				{/* Notifications List */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					{isLoading ? (
						<div className="divide-y divide-gray-200">
							{Array.from({ length: 5 }).map((_, idx) => (
								<div key={idx} className="px-6 py-5 animate-pulse flex gap-4">
									<div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg" />
									<div className="flex-1 space-y-3">
										<div className="h-4 bg-gray-200 rounded w-1/3" />
										<div className="h-3 bg-gray-200 rounded w-2/3" />
										<div className="h-2 bg-gray-200 rounded w-1/4" />
									</div>
								</div>
							))}
						</div>
					) : filteredNotifications.length === 0 ? (
						<div className="text-center py-20 px-4">
							<Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{filter === "unread"
									? "No unread notifications"
									: filter === "read"
									? "No read notifications"
									: "No notifications"}
							</h3>
							<p className="text-gray-500 mb-6">
								{filter === "unread"
									? "You're all caught up!"
									: "Get started by enabling notifications."}
							</p>
							{filter !== "unread" && (
								<button
									onClick={() => setFilter("unread")}
									className="text-blue-600 hover:text-blue-700 font-medium text-sm"
								>
									View unread notifications
								</button>
							)}
						</div>
					) : (
						<ul className="divide-y divide-gray-200">
							{filteredNotifications.map((notification) => (
								<li
									key={notification.id}
									className={`px-6 py-5 hover:bg-gray-50 transition-colors duration-150 ${
										!notification.is_read ? "bg-blue-50" : ""
									}`}
								>
									<div className="flex gap-4">
										<div className="flex-shrink-0">
											<div
												className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
													!notification.is_read
														? "bg-blue-100"
														: "bg-gray-100"
												}`}
											>
												{getNotificationIcon((notification as any).type)}
											</div>
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<p
														className={`text-sm font-semibold ${
															!notification.is_read
																? "text-gray-900"
																: "text-gray-600"
														}`}
													>
														{notification.title}
													</p>
													<p className="text-sm text-gray-600 mt-1 line-clamp-2">
														{notification.message}
													</p>
													<p className="text-xs text-gray-400 mt-2">
														{formatTime(notification.created_at)}
													</p>
												</div>
												{!notification.is_read && (
													<span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
												)}
											</div>
										</div>

										<div className="flex items-center gap-2 ml-4 flex-shrink-0">
											{!notification.is_read && (
												<button
													onClick={() =>
														handleMarkAsRead(notification.id.toString())
													}
													className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
													title="Mark as read"
												>
													<Check className="w-5 h-5" />
												</button>
											)}
											<button
												onClick={() =>
													handleDelete(notification.id.toString())
												}
												className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
												title="Delete notification"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
								disabled={currentPage === 1}
								className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
								aria-label="Previous page"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<span className="text-sm text-gray-700 font-medium px-3 py-2">
								Page <span className="text-blue-600">{currentPage}</span> of{" "}
								<span className="text-blue-600">{totalPages}</span>
							</span>
							<button
								onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
								disabled={currentPage === totalPages}
								className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
								aria-label="Next page"
							>
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>
						<div className="text-sm text-gray-600">
							Showing{" "}
							<span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
							<span className="font-medium">
								{Math.min(currentPage * limit, total)}
							</span>{" "}
							of <span className="font-medium">{total}</span> notifications
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default NotificationsPage;
