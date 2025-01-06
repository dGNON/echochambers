"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/config-utils";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { refinePrompt } from "@/lib/prompt-service";
import { toast } from "sonner";

interface SystemTabProps {
    systemPrompt?: string;
    onSystemPromptChange?: (prompt: string) => void;
}

export function SystemTab({ systemPrompt: externalPrompt = DEFAULT_SYSTEM_PROMPT, onSystemPromptChange }: SystemTabProps) {
    const [prompt, setPrompt] = useLocalStorage(STORAGE_KEYS.SYSTEM_PROMPT, externalPrompt);
    const [isRefining, setIsRefining] = useState(false);

    const handleChange = (value: string) => {
        setPrompt(value);
        onSystemPromptChange?.(value);
    };

    const handleRefine = async () => {
        if (isRefining) return;
        
        setIsRefining(true);
        try {
            const improvedPrompt = await refinePrompt(prompt);
            if (improvedPrompt) {
                handleChange(improvedPrompt);
                toast.success('System prompt refined successfully');
            } else {
                throw new Error('Failed to generate improved prompt');
            }
        } catch (error) {
            console.error('Error refining prompt:', error);
            toast.error('Failed to refine system prompt');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <TabsContent value="system" className="mt-0 h-[400px]">
            <div className="h-full space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">System Prompt</Label>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                            Required
                        </Badge>
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
                </div>
                <div className="h-[calc(100%-2rem)]">
                    <Textarea
                        value={prompt}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Enter your system prompt here..."
                        className="h-full bg-background/50 resize-none focus:ring-1 focus:ring-primary p-3 font-mono text-sm"
                        disabled={isRefining}
                    />
                </div>
            </div>
        </TabsContent>
    );
}
