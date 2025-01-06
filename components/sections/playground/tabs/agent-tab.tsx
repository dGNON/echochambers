"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { AgentConfig } from "../types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_AGENT_CONFIG } from "@/lib/config-utils";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { refinePrompt } from "@/lib/prompt-service";
import { toast } from "sonner";

interface AgentTabProps {
    config: AgentConfig;
    onConfigChange: (config: AgentConfig) => void;
}

export function AgentTab({ config: externalConfig = DEFAULT_AGENT_CONFIG, onConfigChange }: AgentTabProps) {
    const [config, setConfig] = useLocalStorage(STORAGE_KEYS.AGENT_CONFIG, externalConfig);
    const [isRefining, setIsRefining] = useState(false);

    const handleChange = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    const handleRefine = async () => {
        if (isRefining) return;
        
        setIsRefining(true);
        try {
            const [improvedRole, improvedGoals, improvedConstraints] = await Promise.all([
                refinePrompt(`[Agent Role]\n${config.role}`),
                refinePrompt(`[Agent Goals]\n${config.goals}`),
                config.constraints ? refinePrompt(`[Agent Constraints]\n${config.constraints}`) : Promise.resolve(config.constraints)
            ]);

            const newConfig = {
                ...config,
                role: improvedRole,
                goals: improvedGoals,
                constraints: improvedConstraints || config.constraints
            };

            setConfig(newConfig);
            onConfigChange(newConfig);
            toast.success('Agent configuration refined successfully');
        } catch (error) {
            console.error('Error refining agent config:', error);
            toast.error('Failed to refine agent configuration');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="h-[400px] rounded-md">
            <ScrollArea className="h-full px-2">
                <TabsContent value="agent" className="m-1">
                    <div className="flex items-center justify-end mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 relative"
                            onClick={handleRefine}
                            disabled={isRefining}
                        >
                            <Sparkles className={`h-4 w-4 transition-opacity ${isRefining ? 'opacity-0' : 'opacity-100'}`} />
                            {isRefining && (
                                <Loader2 className="h-4 w-4 animate-spin absolute inset-0 m-auto" />
                            )}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Agent Role</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Required
                                </Badge>
                            </div>
                            <Input 
                                value={config.role} 
                                onChange={(e) => handleChange("role", e.target.value)} 
                                placeholder="Define the agent's role..." 
                                className="bg-background/50"
                                disabled={isRefining}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Goals</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Required
                                </Badge>
                            </div>
                            <Textarea 
                                value={config.goals} 
                                onChange={(e) => handleChange("goals", e.target.value)} 
                                placeholder="Define the agent's goals..." 
                                className="min-h-[100px] bg-background/50 resize-none focus:ring-1 focus:ring-primary"
                                disabled={isRefining}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Constraints</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Optional
                                </Badge>
                            </div>
                            <Textarea 
                                value={config.constraints} 
                                onChange={(e) => handleChange("constraints", e.target.value)} 
                                placeholder="Define any constraints..." 
                                className="min-h-[100px] bg-background/50 resize-none focus:ring-1 focus:ring-primary"
                                disabled={isRefining}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Memory</Label>
                                <div className="text-sm text-muted-foreground">Enable memory for contextual awareness</div>
                            </div>
                            <Switch checked={config.memory} onCheckedChange={(checked) => handleChange("memory", checked)} />
                        </div>
                    </div>
                </TabsContent>
            </ScrollArea>
        </div>
    );
}
