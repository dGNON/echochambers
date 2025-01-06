"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Bot, GitBranch, Wand2, Wrench, Send, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkspaceState } from "./types";
import { ModelSettings } from "./settings/model-settings";
import { StepsTab } from "./tabs/steps-tab";
import { FabricateTab } from "./tabs/fabricate-tab";
import { SystemTab } from "./tabs/system-tab";
import { TemplateTab } from "./tabs/template-tab";
import { FunctionsTab } from "./tabs/functions-tab";
import { AgentTab } from "./tabs/agent-tab";
import { ChatContainer } from "./chat/chat-container";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useRef } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
    type?: "chat" | "fabricated";
}

interface Function {
    // Add properties for Function object
}

const initialState: WorkspaceState = {
    messages: [],
    chatMessages: [], // Separate array for actual chat messages
    systemPrompt: "",
    userInput: "",
    isLoading: false,
    modelConfig: {
        model: "gpt-4",
        temperature: 1.0,
        maxTokens: 4096,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        stopSequences: [],
        ecapiKey: "",
        apiKey: "",
        baseUrl: "",
        responseFormat: "",
        stream: false,
        enableScheduling: false,
        scheduleType: "",
        maxRuns: 0,
        cronExpression: "",
        retryStrategy: "",
        enableBatch: false,
        batchSize: 0,
        concurrency: 0,
        debugMode: false,
    },
    promptTemplate: "",
    agentConfig: {
        role: "Assistant",
        goals: "",
        constraints: "",
        memory: true,
    },
    stepPrompts: [],
    availableFunctions: [],
};

export function PlaygroundWorkspace() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<WorkspaceState>(initialState);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState("system");
    const [open, setOpen] = useState(false);
    const [tabOffset, setTabOffset] = useState(0);
    const tabContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const dx = e.pageX - startXRef.current;
        const scrollbarWidth = scrollbarRef.current?.offsetWidth || 0;
        const containerWidth = scrollContainer.offsetWidth;
        const scrollableWidth = scrollContainer.scrollWidth;

        const scrollRatio = scrollableWidth / containerWidth;
        const newScrollLeft = scrollLeftRef.current + dx * scrollRatio;

        scrollContainer.scrollLeft = newScrollLeft;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handlePrevTab = () => {
        if (tabOffset > 0) {
            setTabOffset((prev) => Math.max(0, prev - 1));
        }
    };

    const handleNextTab = () => {
        if (tabContainerRef.current && tabOffset < tabItems.length - 3) {
            setTabOffset((prev) => Math.min(tabItems.length - 3, prev + 1));
        }
    };

    const handleConversationChange = (newMessages: Message[]) => {
        setMessages(newMessages);
        setState((prev) => ({
            ...prev,
            messages: newMessages,
        }));
    };

    const handleAddFunction = () => {
        // TODO: Implement function addition logic
    };

    const tabItems = [
        { value: "system", icon: MessageSquare, label: "System" },
        { value: "template", icon: Wand2, label: "Template" },
        /* { value: "functions", icon: Wrench, label: "Functions" }, */ // Todo: Add Function
        { value: "agent", icon: Bot, label: "Agent" },
        { value: "steps", icon: GitBranch, label: "Steps" },
        { value: "fabricate", icon: MessageSquare, label: "Fabricate" },
    ];

    return (
        <div className="flex-1 container mx-auto px-4 py-6">
            {/* Static Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* System Configuration */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm shadow-lg">
                        <div className="flex-1">
                            <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isMinimized ? "h-12" : "h-[480px]")}>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                                    <div className="overflow-hidden">
                                        <TabsList className={cn("flex w-full justify-between rounded-t-xl rounded-b-none p-0 h-12 bg-background/20 transition-all duration-300", isMinimized ? "rounded-b-xl" : "border-b")}>
                                            {/* Mobile View - Select Dropdown */}
                                            <div className="block sm:hidden flex-1 px-2">
                                                <Select value={activeTab} onValueChange={setActiveTab}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue>
                                                            {(() => {
                                                                const activeItem = tabItems.find((item) => item.value === activeTab);
                                                                if (activeItem) {
                                                                    const Icon = activeItem.icon;
                                                                    return (
                                                                        <div className="flex items-center">
                                                                            <Icon className="h-4 w-4 mr-2" />
                                                                            <span>{activeItem.label}</span>
                                                                        </div>
                                                                    );
                                                                }
                                                                return "Select tab...";
                                                            })()}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tabItems.map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <SelectItem key={item.value} value={item.value} className="flex items-center">
                                                                    <div className="flex items-center">
                                                                        <Icon className="h-4 w-4 mr-2" />
                                                                        <span>{item.label}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Tablet View - Sliding Tabs */}
                                            <div className="hidden sm:block lg:hidden max-w-[calc(100%-48px)] relative">
                                                <div className="flex items-center">
                                                    <Button variant="ghost" size="icon" onClick={handlePrevTab} disabled={tabOffset === 0} className={cn("h-12 w-8 px-0 hover:bg-background/30", tabOffset === 0 && "opacity-50 cursor-not-allowed", isMinimized && "hidden")}>
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>

                                                    <div ref={tabContainerRef} className="flex overflow-hidden transition-transform duration-200 ease-in-out">
                                                        <div
                                                            className="flex transition-transform duration-200 ease-in-out"
                                                            style={{
                                                                transform: `translateX(-${tabOffset * 100}px)`,
                                                            }}
                                                        >
                                                            {tabItems.map(({ value, icon: Icon, label }) => (
                                                                <TabsTrigger key={value} value={value} className={cn("min-w-[100px] whitespace-nowrap rounded-t-xl rounded-b-none", "data-[state=active]:border-b-2 data-[state=active]:border-primary", "h-12 flex-shrink-0 px-3", isMinimized && "hidden")}>
                                                                    <Icon className="h-4 w-4 mr-2 shrink-0" />
                                                                    <span className="truncate">{label}</span>
                                                                </TabsTrigger>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Button variant="ghost" size="icon" onClick={handleNextTab} disabled={tabOffset >= tabItems.length - 3} className={cn("h-12 w-8 px-0 hover:bg-background/30", tabOffset >= tabItems.length - 3 && "opacity-50 cursor-not-allowed", isMinimized && "hidden")}>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Desktop View - Full Tabs */}
                                            <div className="hidden lg:block max-w-[calc(100%-48px)]">
                                                <div className="flex">
                                                    {tabItems.map(({ value, icon: Icon, label }) => (
                                                        <TabsTrigger key={value} value={value} className={cn("min-w-[120px] rounded-t-xl rounded-b-none data-[state=active]:border-b-[1px] data-[state=active]:border-primary h-12 flex-shrink-0", isMinimized && "hidden")}>
                                                            <Icon className="h-4 w-4 mr-2 shrink-0" />
                                                            <span className="truncate">{label}</span>
                                                        </TabsTrigger>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-12 w-12 rounded-xl hover:bg-background/30 flex-shrink-0">
                                                {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                            </Button>
                                        </TabsList>
                                    </div>

                                    <div className="p-4">
                                        <TabsContent value="system" className="mt-0">
                                            <SystemTab systemPrompt={state.systemPrompt || ""} onSystemPromptChange={(prompt) => setState((prev) => ({ ...prev, systemPrompt: prompt }))} />
                                        </TabsContent>
                                        <TabsContent value="template" className="mt-0">
                                            <TemplateTab template={state.promptTemplate || ""} onTemplateChange={(template) => setState((prev) => ({ ...prev, promptTemplate: template }))} />
                                        </TabsContent>
                                        <TabsContent value="functions" className="mt-0">
                                            <FunctionsTab functions={state.availableFunctions || []} onFunctionsChange={(funcs) => setState((prev) => ({ ...prev, availableFunctions: funcs }))} />
                                        </TabsContent>
                                        <TabsContent value="agent" className="mt-0">
                                            <AgentTab
                                                config={
                                                    state.agentConfig || {
                                                        role: "Assistant",
                                                        goals: "",
                                                        constraints: "",
                                                        memory: true,
                                                    }
                                                }
                                                onConfigChange={(config) => setState((prev) => ({ ...prev, agentConfig: config }))}
                                            />
                                        </TabsContent>
                                        <TabsContent value="steps" className="mt-0">
                                            <StepsTab steps={state.stepPrompts || []} onStepsChange={(steps) => setState((prev) => ({ ...prev, stepPrompts: steps }))} />
                                        </TabsContent>
                                        <TabsContent value="fabricate" className="mt-0">
                                            <FabricateTab onConversationChange={(messages) => setState((prev) => ({ ...prev, messages }))} />
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat Area */}
                    <ChatContainer />
                </div>

                {/* Settings Panel */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-4">
                    <ModelSettings modelConfig={state.modelConfig} onModelConfigChange={(config) => setState((prev) => ({ ...prev, modelConfig: config }))} />
                </motion.div>
            </motion.div>
        </div>
    );
}
