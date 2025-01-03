"use client";

import { Message } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2, Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import ReactMarkdown, { Components } from "react-markdown";
import { ComponentPropsWithoutRef } from "react";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import("framer-motion").then((mod) => mod.AnimatePresence), { ssr: false });

interface ChatAreaProps {
    messages: Message[];
    userInput: string;
    isLoading: boolean;
    processingStep?: {
        number: number;
        name: string;
    };
    onUserInputChange: (input: string) => void;
    onSend: () => void;
    clearChat: () => void;
}

export function ChatArea({ messages, userInput, isLoading, processingStep, onUserInputChange, onSend, clearChat }: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    const forceScrollToBottom = () => {
        // Try multiple times to ensure it scrolls
        requestAnimationFrame(() => {
            scrollToBottom();
            setTimeout(scrollToBottom, 50);
            setTimeout(scrollToBottom, 100);
            setTimeout(scrollToBottom, 200);
        });
    };

    useEffect(() => {
        // Scroll when messages length changes or when loading state changes
        forceScrollToBottom();
    }, [messages.length, isLoading]);

    useEffect(() => {
        if (scrollRef.current && !isExpanded) {
            // When minimizing, wait for the transition and then scroll
            const timeoutId = setTimeout(forceScrollToBottom, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [isExpanded]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        onSend();
        forceScrollToBottom();
    };

    const handleExpand = (expand: boolean) => {
        setIsExpanded(expand);
        if (!expand) {
            forceScrollToBottom();
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isExpanded && <MotionDiv key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => handleExpand(false)} />}
            <MotionDiv
                key="chat-window"
                initial={{ opacity: 1 }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn("flex flex-col rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm shadow-lg", !isExpanded ? "h-[600px] w-full relative" : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[93vw] h-[87vh] md:w-[90vw] md:h-[87vh] lg:w-[69vw] lg:h-[80vh] z-50 shadow-2xl")}
            >
                <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/20">
                    <h2 className="text-lg font-semibold">Simulated Environment</h2>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button onClick={clearChat} className="h-8 px-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted/50 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                        <button onClick={() => handleExpand(!isExpanded)} className="h-8 px-2 text-muted-foreground hover:text-primary rounded-md hover:bg-muted/50 transition-colors">
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <ScrollArea ref={scrollRef} className="flex-1 p-3">
                    <div className="space-y-3">
                        {messages.map((message, index) => (
                            <MotionDiv key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[80%] rounded-xl px-3 py-2 shadow-md", message.role === "user" ? "bg-primary/90 backdrop-blur-sm text-primary-foreground" : "bg-muted/90 backdrop-blur-sm")}>
                                    <div className="text-xs font-medium mb-1">{message.role === "user" ? "You" : "Assistant"}</div>
                                    <ReactMarkdown
                                        className="prose prose-sm dark:prose-invert max-w-none break-words"
                                        components={{
                                            p({ children }) {
                                                return <p className="mb-2 last:mb-0 text-sm whitespace-pre-wrap break-words">{children}</p>;
                                            },
                                            code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isInline = !match;
                                                const codeString = String(children).trim();

                                                if (isInline) {
                                                    return (
                                                        <code className="bg-card/30 rounded px-1 text-xs whitespace-pre-wrap break-all" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                                return (
                                                    <div className="relative my-3">
                                                        <div className="absolute right-1">
                                                            <button onClick={() => copyToClipboard(codeString)} className="p-1.5 rounded-md bg-muted/10 hover:bg-muted transition-colors" title="Copy code">
                                                                {copiedCode === codeString ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-muted/20">
                                                            <span className="text-xs text-muted-foreground">{match ? match[1] : "code"}</span>
                                                        </div>
                                                        <code className="block bg-card/30 p-3 rounded-lg text-xs whitespace-pre-wrap break-all overflow-x-auto" {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                );
                                            },
                                            ul({ children }) {
                                                return <ul className="list-disc pl-4 mb-2 space-y-1 text-sm break-words">{children}</ul>;
                                            },
                                            ol({ children }) {
                                                return <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm break-words">{children}</ol>;
                                            },
                                            li({ children }) {
                                                return <li className="mb-1 text-sm break-words">{children}</li>;
                                            },
                                            h1({ children }) {
                                                return <h1 className="text-lg font-semibold mb-2 mt-3 break-words">{children}</h1>;
                                            },
                                            h2({ children }) {
                                                return <h2 className="text-base font-semibold mb-2 mt-3 break-words">{children}</h2>;
                                            },
                                            h3({ children }) {
                                                return <h3 className="text-sm font-semibold mb-2 mt-3 break-words">{children}</h3>;
                                            },
                                            blockquote({ children }) {
                                                return <blockquote className="border-l-2 border-muted pl-4 italic my-2 break-words">{children}</blockquote>;
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </MotionDiv>
                        ))}
                        {isLoading && (
                            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-muted/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {processingStep ? (
                                                <>
                                                    Processing Step {processingStep.number}: {processingStep.name}...
                                                </>
                                            ) : (
                                                <>Thinking...</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </MotionDiv>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background/20 backdrop-blur-sm">
                    <div className="flex gap-3">
                        <Textarea ref={textareaRef} value={userInput} onChange={(e) => onUserInputChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="min-h-[80px] bg-background/50 resize-none focus-visible:ring-1 focus-visible:ring-primary font-mono" />
                        <button onClick={onSend} disabled={isLoading || !userInput.trim()} className={cn("bg-primary/10 hover:bg-primary shadow-md transition-all duration-200 rounded-md p-2", "h-[42px] w-[42px] flex items-center justify-center", (isLoading || !userInput.trim()) && "opacity-50 cursor-not-allowed")}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </MotionDiv>
        </AnimatePresence>
    );
}
