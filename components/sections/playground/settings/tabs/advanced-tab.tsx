"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModelConfig } from "../../types";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Key } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";

// Default values for the advanced settings
const DEFAULT_CONFIG = {
    responseFormat: "text",
    temperature: 1.11,
    topP: 0.9,
    frequencyPenalty: 0.21,
    presencePenalty: 0.12,
    maxTokens: 4096,
    stopSequences: [],
    stream: false,
};

interface AdvancedTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

export function AdvancedTab({ modelConfig, onModelConfigChange }: AdvancedTabProps) {
    const isInitializedRef = useRef(false);

    // Load saved config from localStorage only once on mount
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        const savedConfig = localStorage.getItem(STORAGE_KEYS.ADVANCED_CONFIG);
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                onModelConfigChange({
                    ...modelConfig,
                    responseFormat: parsedConfig.responseFormat ?? DEFAULT_CONFIG.responseFormat,
                    temperature: parsedConfig.temperature ?? DEFAULT_CONFIG.temperature,
                    topP: parsedConfig.topP ?? DEFAULT_CONFIG.topP,
                    frequencyPenalty: parsedConfig.frequencyPenalty ?? DEFAULT_CONFIG.frequencyPenalty,
                    presencePenalty: parsedConfig.presencePenalty ?? DEFAULT_CONFIG.presencePenalty,
                    maxTokens: parsedConfig.maxTokens ?? DEFAULT_CONFIG.maxTokens,
                    stopSequences: parsedConfig.stopSequences ?? DEFAULT_CONFIG.stopSequences,
                    stream: parsedConfig.stream ?? DEFAULT_CONFIG.stream,
                });
            } catch (error) {
                console.error("Error parsing saved advanced config:", error);
                // If there's an error, set default values
                onModelConfigChange({
                    ...modelConfig,
                    ...DEFAULT_CONFIG,
                });
            }
        } else {
            // If no saved config, set default values
            onModelConfigChange({
                ...modelConfig,
                ...DEFAULT_CONFIG,
            });
        }
    }, []); // Empty dependency array since we only want this to run once on mount

    // Save config to localStorage whenever it changes
    useEffect(() => {
        if (!isInitializedRef.current) return; // Skip saving during initialization

        const configToSave = {
            responseFormat: modelConfig.responseFormat,
            temperature: modelConfig.temperature,
            topP: modelConfig.topP,
            frequencyPenalty: modelConfig.frequencyPenalty,
            presencePenalty: modelConfig.presencePenalty,
            maxTokens: modelConfig.maxTokens,
            stopSequences: modelConfig.stopSequences,
            stream: modelConfig.stream,
        };

        const currentSaved = localStorage.getItem(STORAGE_KEYS.ADVANCED_CONFIG);
        if (currentSaved) {
            const currentConfig = JSON.parse(currentSaved);
            if (JSON.stringify(currentConfig) === JSON.stringify(configToSave)) {
                return; // Skip if no changes
            }
        }

        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(configToSave));
    }, [modelConfig]);

    return (
        <div className="space-y-6">

            {/* Basic Parameters */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Model Parameters</Label>
                </div>
                <Card className="p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Temperature</Label>
                            <span className="text-xs text-muted-foreground font-mono">{modelConfig.temperature.toFixed(1)}</span>
                        </div>
                        <Slider value={[modelConfig.temperature]} onValueChange={([value]) => onModelConfigChange({ ...modelConfig, temperature: value })} min={0} max={2} step={0.1} className="[&_[role=slider]]:shadow-sm" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Precise & Deterministic</span>
                            <span>Creative & Random</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Top P</Label>
                            <span className="text-xs text-muted-foreground font-mono">{modelConfig.topP.toFixed(2)}</span>
                        </div>
                        <Slider value={[modelConfig.topP]} onValueChange={([value]) => onModelConfigChange({ ...modelConfig, topP: value })} min={0} max={1} step={0.01} className="[&_[role=slider]]:shadow-sm" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Focused</span>
                            <span>Diverse</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Frequency Penalty</Label>
                            <span className="text-xs text-muted-foreground font-mono">{modelConfig.frequencyPenalty.toFixed(2)}</span>
                        </div>
                        <Slider value={[modelConfig.frequencyPenalty]} onValueChange={([value]) => onModelConfigChange({ ...modelConfig, frequencyPenalty: value })} min={-2} max={2} step={0.01} className="[&_[role=slider]]:shadow-sm" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Repetitive</span>
                            <span>Varied</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Presence Penalty</Label>
                            <span className="text-xs text-muted-foreground font-mono">{modelConfig.presencePenalty.toFixed(2)}</span>
                        </div>
                        <Slider value={[modelConfig.presencePenalty]} onValueChange={([value]) => onModelConfigChange({ ...modelConfig, presencePenalty: value })} min={-2} max={2} step={0.01} className="[&_[role=slider]]:shadow-sm" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Focused</span>
                            <span>Exploratory</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Maximum Tokens</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={modelConfig.maxTokens}
                                onChange={(e) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        maxTokens: Number(e.target.value),
                                    })
                                }
                                min={69}
                                max={128000}
                                className="bg-background/50 resize-none focus:ring-1 focus:ring-primary font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Stop Sequences</Label>
                            <Badge variant="outline" className="font-mono text-xs">
                                Optional
                            </Badge>
                        </div>
                        <Textarea
                            placeholder="Enter sequences, one per line"
                            value={modelConfig.stopSequences?.join("\n") || ""}
                            onChange={(e) =>
                                onModelConfigChange({
                                    ...modelConfig,
                                    stopSequences: e.target.value.split("\n").filter(Boolean),
                                })
                            }
                            className="min-h-[80px] bg-background/50 resize-none focus:ring-1 focus:ring-primary font-mono text-sm"
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">Response Format</Label>
                            <Select
                                value={modelConfig.responseFormat || "text"}
                                onValueChange={(value) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        responseFormat: value as "text" | "json" | "markdown",
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Plain Text</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </div>

            {/* <Separator className="bg-border/50" />

            <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium">Stream Tokens</Label>
                        <p className="text-xs text-muted-foreground">Enable token streaming for real-time responses</p>
                    </div>
                    <Switch checked={modelConfig.stream} onCheckedChange={(checked) => onModelConfigChange({ ...modelConfig, stream: checked })} />
                </div>
            </Card> */}
        </div>
    );
}
