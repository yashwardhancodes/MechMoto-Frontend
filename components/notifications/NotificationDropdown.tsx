import React, { useState } from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import { Notification } from "@/lib/redux/api/notificationApi";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
	unreadNotifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
	unreadNotifications,
	unreadCount,
	isLoading,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleShowAll = () => {
		setIsOpen(false);
		router.push("/notifications");
	};

	const handleClearAll = () => {
		// Implement clear all notifications logic
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

	return (
		<div className="relative">
			<button
				onClick={toggleDropdown}
				className="relative inline-flex items-center justify-center p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				aria-label="Notifications"
				aria-expanded={isOpen}
			>
				<Bell className="w-5 h-5" strokeWidth={1.5} />
				{unreadCount > 0 && (
					<span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<>
					{/* Backdrop */}
					<div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

					{/* Dropdown Panel */}
					<div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
						{/* Header */}
						<div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-base font-semibold text-gray-900">
										Notifications
									</h3>
									<p className="text-xs text-gray-500 mt-0.5">
										{unreadCount} new{" "}
										{unreadCount === 1 ? "notification" : "notifications"}
									</p>
								</div>
								<button
									onClick={() => setIsOpen(false)}
									className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
									aria-label="Close"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Content */}
						<div className="max-h-96 overflow-y-auto">
							{isLoading ? (
								<div className="flex items-center justify-center py-12">
									<div className="flex flex-col items-center gap-2">
										<div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
										<p className="text-sm text-gray-500">
											Loading notifications...
										</p>
									</div>
								</div>
							) : unreadNotifications.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 px-4">
									<Bell className="w-12 h-12 text-gray-300 mb-2" />
									<p className="text-sm font-medium text-gray-900">
										No new notifications
									</p>
									<p className="text-xs text-gray-500 text-center mt-1">
										You&apos;re all caught up. Check back later!
									</p>
								</div>
							) : (
								<ul className="divide-y divide-gray-100">
									{unreadNotifications.map((notification) => (
										<li
											key={notification.id}
											className="px-6 py-4 hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
										>
											<div className="flex gap-4">
												<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg group-hover:bg-blue-100 transition-colors">
													{getNotificationIcon(
														(notification as any).type,
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
														<p className="text-sm font-semibold text-gray-900 truncate">
															{notification.title}
														</p>
														<span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
													</div>
													<p className="text-sm text-gray-600 mt-1 line-clamp-2">
														{notification.message}
													</p>
													<p className="text-xs text-gray-400 mt-2">
														{formatTime(notification.created_at)}
													</p>
												</div>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* Footer */}
						{unreadNotifications.length > 0 && (
							<div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
								<button
									onClick={handleClearAll}
									className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
								>
									Clear all
								</button>
								<button
									onClick={handleShowAll}
									className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors group"
								>
									View all
									<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default NotificationDropdown;
