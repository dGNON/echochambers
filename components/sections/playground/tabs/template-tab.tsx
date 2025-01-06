"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_TEMPLATE } from "@/lib/config-utils";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { refinePrompt } from "@/lib/prompt-service";
import { toast } from "sonner";

interface TemplateTabProps {
    template: string;
    onTemplateChange: (template: string) => void;
}

export function TemplateTab({ template: externalTemplate = DEFAULT_TEMPLATE, onTemplateChange }: TemplateTabProps) {
    const [template, setTemplate] = useLocalStorage(STORAGE_KEYS.TEMPLATE_CONFIG, externalTemplate);
    const [isRefining, setIsRefining] = useState(false);

    const handleChange = (value: string) => {
        setTemplate(value);
        onTemplateChange?.(value);
    };

    const handleRefine = async () => {
        if (isRefining) return;
        
        setIsRefining(true);
        try {
            const improvedTemplate = await refinePrompt(template);
            if (improvedTemplate) {
                handleChange(improvedTemplate);
                toast.success('Template refined successfully');
            } else {
                throw new Error('Failed to generate improved template');
            }
        } catch (error) {
            console.error('Error refining template:', error);
            toast.error('Failed to refine template');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <TabsContent value="template" className="mt-0 h-[400px]">
            <div className="h-full space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Prompt Template</Label>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                            Optional
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
                        value={template}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={`Given the following {{data_type}}:
{{data}}

Analyze and provide insights on:
1. {{aspect_1}}
2. {{aspect_2}}
3. {{aspect_3}}

Consider {{context}} in your analysis.`}
                        className="h-full bg-background/50 resize-none focus:ring-1 focus:ring-primary p-3 font-mono text-sm"
                        disabled={isRefining}
                    />
                </div>
            </div>
        </TabsContent>
    );
}
