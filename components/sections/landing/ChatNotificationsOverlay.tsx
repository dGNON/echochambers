"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "@/server/types";
import { usePathname } from "next/navigation";

interface NotificationMessage extends ChatMessage {
	id: string;
	notificationId: string;
}

export function ChatNotificationsOverlay() {
	const pathname = usePathname();
	const [messages, setMessages] = useState<NotificationMessage[]>([]);
	const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set());
	const [isHovered, setIsHovered] = useState(false);

	// Only show on landing page
	if (pathname !== "/") {
		return null;
	}

	const fetchLatestMessages = async () => {
		try {
			const roomsResponse = await fetch("/api/rooms");
			if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
			const roomsData = await roomsResponse.json();

			const messagePromises = roomsData.rooms.map(async (room: { id: string }) => {
				const normalizedRoomId = room.id.toLowerCase().replace("#", "");
				const response = await fetch(`/api/rooms/${normalizedRoomId}/history`);
				if (!response.ok) return [];
				const data = await response.json();
				return data.messages || [];
			});

			const allMessagesArrays = await Promise.all(messagePromises);
			const allMessages = allMessagesArrays.flat();

			const sortedMessages = allMessages.sort((a: ChatMessage, b: ChatMessage) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

			const newMessages = sortedMessages
				.filter((msg: ChatMessage) => !seenMessageIds.has(msg.id))
				.map((msg: ChatMessage) => ({
					...msg,
					notificationId: Math.random().toString(36).slice(2),
				}));

			if (newMessages.length > 0) {
				setSeenMessageIds((prev) => {
					const newSet = new Set(prev);
					newMessages.forEach((msg) => newSet.add(msg.id));
					return newSet;
				});

				setMessages((prev) => [...newMessages, ...prev].slice(0, 10));
			}
		} catch (error) {
			console.error("Error fetching messages:", error);
		}
	};

	useEffect(() => {
		if (pathname === "/") {
			fetchLatestMessages();
			const interval = setInterval(fetchLatestMessages, 2000);
			return () => clearInterval(interval);
		}
	}, [pathname]);

	return (
		<div
			className="fixed bottom-8 right-8 z-50"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			<AnimatePresence>
				{messages.slice(0, isHovered ? 5 : 1).map((message, index) => (
					<motion.div
						key={message.notificationId}
						initial={{ opacity: 0, y: 20, scale: 0.95, x: index * 10 }}
						animate={{
							opacity: isHovered ? 1 : index === 0 ? 1 : 0.5,
							y: 0,
							scale: 1,
							x: isHovered ? 0 : index * 10,
							zIndex: messages.length - index,
						}}
						exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
						className="bg-card/80 backdrop-blur-sm border rounded-lg shadow-lg p-4 max-w-[400px] mb-2 cursor-pointer transition-all duration-200"
						style={{
							position: "relative",
							marginTop: isHovered ? "0.5rem" : "-3.5rem",
						}}>
						<div className="flex items-start gap-3">
							<div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center">
								<span className="text-xs font-medium text-primary">{message.sender?.username?.charAt(0).toUpperCase() || '?'}</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium mb-0.5">{message.sender?.username || 'Unknown'}</p>
								<p className="text-sm text-muted-foreground truncate">{message.content}</p>
							</div>
						</div>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
