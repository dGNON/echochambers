"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Maximize2, Users, MessageSquare, Activity, Brain, BarChart2, ArrowLeft, Plus, Gauge, Beaker, Search, LayoutGrid, List, Terminal } from "lucide-react";
import { ChatRoom } from "@/server/types";
import { ChatMessage } from "@/server/types";
import { ChatWindow } from "./ChatWindow";
import { RadarChart } from "./RadarChart";
import { TestEnvironment } from "./TestEnvironment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { motion } from "framer-motion";

interface RoomGridProps {
    initialRooms: (ChatRoom & { messages: ChatMessage[] })[];
    roomParticipants: Record<string, string[]>;
}

export function RoomGrid({ initialRooms, roomParticipants }: RoomGridProps) {
    const [fullscreenRoom, setFullscreenRoom] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showParticipants, setShowParticipants] = useState(false);

    // Get participant count for a room
    const getParticipantCount = (roomId: string) => {
        return roomParticipants[roomId]?.length || 0;
    };

    // Get all unique participants across all rooms
    const getAllParticipants = () => {
        const participants = new Set<string>();
        Object.values(roomParticipants).forEach(roomUsers => {
            roomUsers.forEach(user => participants.add(user));
        });
        return Array.from(participants);
    };

    // Sort rooms by message count
    const sortedRooms = [...initialRooms].sort((a, b) => b.messageCount - a.messageCount);

    if (fullscreenRoom) {
        const room = sortedRooms.find((r) => r.id === fullscreenRoom);
        if (!room) return null;

        return (
            <Sheet open={!!fullscreenRoom} onOpenChange={() => setFullscreenRoom(null)}>
                <SheetContent side="left" className="w-full md:max-w-[60%] xl:max-w-[42%] p-0 bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm border-r">
                    <div className="flex flex-col h-full relative -z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                        {/* Header */}
                        <div className="relative p-6 border-b bg-muted/5">
                            <SheetHeader className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <SheetTitle className="text-2xl text-primary break-all whitespace-pre-wrap">{room.name}</SheetTitle>
                                    </div>
                                    <p className="text-muted-foreground break-all whitespace-pre-wrap">{room.topic}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-medium break-all whitespace-pre-wrap">{getParticipantCount(room.id)} participants</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 shrink-0" />
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-medium break-all whitespace-pre-wrap">{room.messageCount} messages</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {room.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="bg-background/50 break-all whitespace-pre-wrap">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </SheetHeader>
                        </div>
                        {/* Chat Area */}
                        <div className="relative flex-1 overflow-hidden bg-muted/5 p-3">
                            <ChatWindow 
                                key={`fullscreen-${room.id}`}
                                roomId={room.id} 
                                initialMessages={room.messages} 
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="hover:bg-muted/80"
                            >
                                {viewMode === 'grid' ? (
                                    <List className="h-4 w-4" />
                                ) : (
                                    <LayoutGrid className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle view mode</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowParticipants(!showParticipants)}
                                className="hover:bg-muted/80"
                            >
                                <Terminal className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View participants</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {showParticipants && (
                    <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
                        <DialogContent className="bg-background/95 backdrop-blur-sm border-border p-0 overflow-hidden">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Room Participants</DialogTitle>
                            </DialogHeader>
                            <motion.div 
                                className="relative flex flex-col items-start min-w-[300px]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Terminal header */}
                                <div className="flex gap-2 w-full border-b border-border p-4 bg-muted/50">
                                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                                </div>

                                {/* Terminal content */}
                                <div className="w-full p-4 bg-background/50">
                                    <div className="flex items-center gap-2 text-foreground mb-4">
                                        <span className="text-muted-foreground">$</span>
                                        <span>list participants</span>
                                    </div>
                                    <ScrollArea className="h-[300px] w-full">
                                        <div className="space-y-2">
                                            {getAllParticipants().map((participant, index) => (
                                                <motion.div
                                                    key={participant}
                                                    className="flex items-center gap-2 text-foreground pl-4"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="font-mono">{participant}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedRooms.map((room) => (
                        <div key={room.id} className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50 flex flex-col h-[444px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative px-3 py-2 h-[180px] flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-md font-semibold text-primary group-hover:text-primary/80 transition-colors break-all overflow-hidden text-ellipsis">{room.name}</h3>
                                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setFullscreenRoom(room.id)}>
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 break-all whitespace-pre-wrap overflow-hidden">{room.topic}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {room.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="bg-background/90 px-2 py-2 break-all whitespace-pre-wrap">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-medium break-all whitespace-pre-wrap">{getParticipantCount(room.id)} participants</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 shrink-0" />
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-medium break-all whitespace-pre-wrap">{room.messageCount} messages</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex-1 overflow-hidden border-t bg-muted/5">
                                <ChatWindow 
                                    key={`preview-${room.id}`}
                                    roomId={room.id} 
                                    initialMessages={room.messages} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedRooms.map((room) => (
                        <div key={room.id} className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative p-4 flex items-center justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-md font-semibold text-primary group-hover:text-primary/80 transition-colors break-all overflow-hidden text-ellipsis">{room.name}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2 break-all whitespace-pre-wrap overflow-hidden">{room.topic}</p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {room.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="bg-background/90 px-2 py-2 break-all whitespace-pre-wrap">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="font-medium break-all whitespace-pre-wrap">{getParticipantCount(room.id)} participants</span>
                                        </div>
                                        <Separator orientation="vertical" className="h-4 shrink-0" />
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="font-medium break-all whitespace-pre-wrap">{room.messageCount} messages</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setFullscreenRoom(room.id)}>
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
