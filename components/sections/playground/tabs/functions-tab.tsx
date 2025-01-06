"use client";

import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Twitter, Globe, Heart, MessageCircle, Search, TrendingUp, BarChart2, Repeat, Zap, Bot, Share2, Mail, AlertTriangle, Cpu, Database, LineChart, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_FUNCTIONS } from "@/lib/config-utils";
import { Function } from "../types";

interface FunctionsTabProps {
    functions: Function[];
    onFunctionsChange: (functions: Function[]) => void;
}

const predefinedFunctions: Function[] = [
    // Twitter Functions
    {
        name: "twitter_like",
        description: "Like tweets and interact with Twitter content",
        enabled: false,
        category: "Social",
        icon: Heart,
    },
    {
        name: "twitter_post",
        description: "Create and post new tweets to your Twitter account",
        enabled: false,
        category: "Social",
        icon: Twitter,
    },
    {
        name: "twitter_quote",
        description: "Quote tweets and share their content",
        enabled: false,
        category: "Social",
        icon: Twitter,
    },
    {
        name: "twitter_reply",
        description: "Reply to existing tweets on Twitter",
        enabled: false,
        category: "Social",
        icon: MessageCircle,
    },
    {
        name: "twitter_scrape",
        description: "Search and collect tweets based on keywords, hashtags, or users",
        enabled: false,
        category: "Social",
        icon: Search,
    },

    // Trading Functions
    {
        name: "trade_spot",
        description: "Execute spot trades across multiple exchanges",
        enabled: false,
        category: "Trading",
        icon: TrendingUp,
    },
    {
        name: "trade_futures",
        description: "Trade perpetual futures with leverage",
        enabled: false,
        category: "Trading",
        icon: LineChart,
        beta: true,
    },
    {
        name: "trade_grid",
        description: "Set up automated grid trading strategies",
        enabled: false,
        category: "Trading",
        icon: BarChart2,
    },
    {
        name: "trade_copy",
        description: "Copy trades from successful traders automatically",
        enabled: false,
        category: "Trading",
        icon: Repeat,
        beta: true,
    },
    {
        name: "trade_correlations",
        description: "Find correlated assets and arbitrage opportunities",
        enabled: false,
        category: "Trading",
        icon: Share2,
    },

    // Market Analysis
    {
        name: "market_sentiment",
        description: "Analyze market sentiment from social media and news",
        enabled: false,
        category: "Analysis",
        icon: Bot,
    },

    // Automation
    {
        name: "auto_scheduler",
        description: "Schedule and automate recurring tasks and workflows",
        enabled: false,
        category: "Automation",
        icon: Repeat,
    },
    {
        name: "auto_monitor",
        description: "Monitor websites, APIs, and services for changes or availability",
        enabled: false,
        category: "Automation",
        icon: Mail,
    },
    {
        name: "auto_sync",
        description: "Sync data between different platforms and services",
        enabled: false,
        category: "Automation",
        icon: Cpu,
        beta: true,
    },
    {
        name: "auto_backup",
        description: "Automated backups and archiving of important data through cloud services",
        enabled: false,
        category: "Automation",
        icon: Database,
    },
    {
        name: "auto_reports",
        description: "Generate and distribute automated reports and analytics",
        enabled: false,
        category: "Automation",
        icon: BarChart2,
        beta: true,
    },

    // Web Functions
    {
        name: "web_scrape",
        description: "Extract structured data from any website automatically",
        enabled: false,
        category: "Web",
        icon: Globe,
    },
    {
        name: "web_browse",
        description: "Navigate and interact with web pages programmatically",
        enabled: false,
        category: "Web",
        icon: Globe,
    },
    {
        name: "web_search",
        description: "Search for information and resources on the web",
        enabled: false,
        category: "Web",
        icon: Search,
    },
];

export function FunctionsTab({ functions: externalFunctions = DEFAULT_FUNCTIONS, onFunctionsChange }: FunctionsTabProps) {
    const [selectedFunctions, setSelectedFunctions] = useLocalStorage<Function[]>(
        STORAGE_KEYS.FUNCTION_CONFIG,
        DEFAULT_FUNCTIONS
    );
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    // Initialize functions with enabled state from saved functions
    const [functions, setFunctions] = useState(() => 
        predefinedFunctions.map(func => ({
            ...func,
            enabled: selectedFunctions.some(saved => saved.name === func.name)
        }))
    );

    const handleToggleFunction = (index: number) => {
        const newFunctions = [...functions];
        newFunctions[index].enabled = !newFunctions[index].enabled;
        setFunctions(newFunctions);

        // Save enabled functions to local storage
        const enabledFunctions = newFunctions
            .filter(func => func.enabled)
            .map(func => ({ ...func, enabled: true }));
        setSelectedFunctions(enabledFunctions);
        
        onFunctionsChange?.(newFunctions);
    };

    const handleToggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Group functions by category
    const groupedFunctions = functions.reduce((acc, func) => {
        if (!acc[func.category]) {
            acc[func.category] = [];
        }
        acc[func.category].push(func);
        return acc;
    }, {} as Record<string, Function[]>);

    return (
        <TabsContent value="functions" className="mt-0 h-[400px]">
            <ScrollArea className="h-full px-1">
                <div className="space-y-6 p-2">
                    {Object.entries(groupedFunctions).map(([category, categoryFunctions]) => (
                        <div key={category} className="space-y-4">
                            <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent" onClick={() => handleToggleCategory(category)}>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-semibold">{category}</h3>
                                    <Badge variant="secondary">
                                        {categoryFunctions.filter((f) => f.enabled).length}/{categoryFunctions.length}
                                    </Badge>
                                </div>
                                <ChevronDown className={`h-5 w-5 transition-transform mr-1 ${collapsedCategories[category] ? "-rotate-90" : ""}`} />
                            </Button>
                            <div className={`grid gap-3 transition-all ${collapsedCategories[category] ? "hidden" : ""}`}>
                                {categoryFunctions.map((func, index) => {
                                    const globalIndex = functions.findIndex((f) => f.name === func.name);
                                    const Icon = func.icon;
                                    return (
                                        <Card key={func.name} className={`transition-colors bg-background/50 ${func.enabled ? "border-primary" : ""}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="mt-1">
                                                            <Icon className={`h-5 w-5 ${func.enabled ? "text-primary" : "text-muted-foreground"}`} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-medium leading-none">{func.name}</h4>
                                                                {func.beta && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        BETA
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{func.description}</p>
                                                        </div>
                                                    </div>
                                                    <Switch checked={func.enabled} onCheckedChange={() => handleToggleFunction(globalIndex)} className="ml-4" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </TabsContent>
    );
}
