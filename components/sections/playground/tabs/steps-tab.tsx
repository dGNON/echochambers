"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ChevronUp, ChevronDown, ChevronRight, ChevronDown as Expand, Loader2, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DEFAULT_STEPS, DEFAULT_STEP, DEFAULT_STEP_PARAMS } from "@/lib/config-utils";
import { StepPrompt, StepParams } from "../types";
import { refinePrompt } from "@/lib/prompt-service";
import { toast } from "sonner";

interface StepsTabProps {
    steps: StepPrompt[];
    onStepsChange: (steps: StepPrompt[]) => void;
}

const defaultParams: StepParams = DEFAULT_STEP_PARAMS;

export function StepsTab({ steps: externalSteps = DEFAULT_STEPS, onStepsChange }: StepsTabProps) {
    const [steps, setSteps] = useLocalStorage<StepPrompt[]>(STORAGE_KEYS.STEPS_CONFIG, externalSteps);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [refiningStep, setRefiningStep] = useState<number | null>(null);

    const handleStepChange = (index: number, updates: Partial<StepPrompt>) => {
        const newSteps = steps.map((step, i) => 
            i === index ? { ...step, ...updates } : step
        );
        setSteps(newSteps);
        onStepsChange(newSteps);
    };

    const handleParamChange = (index: number, paramUpdates: Partial<StepParams>) => {
        const newSteps = steps.map((step, i) => {
            if (i !== index) return step;
            return {
                ...step,
                params: { ...(step.params || defaultParams), ...paramUpdates }
            };
        });
        setSteps(newSteps);
        onStepsChange(newSteps);
    };

    const handleRefineStep = async (index: number) => {
        if (refiningStep !== null) return;
        
        setRefiningStep(index);
        try {
            const stepName = steps[index].name || `Step ${index + 1}`;
            const improvedPrompt = await refinePrompt(`[Step Name: ${stepName}]\n${steps[index].prompt}\n\nAdhere to the Step Name. The content generated should complement the Step Name.`);
            if (improvedPrompt) {
                handleStepChange(index, { prompt: improvedPrompt });
                toast.success(`${stepName} refined successfully`);
            } else {
                throw new Error('Failed to generate improved prompt');
            }
        } catch (error) {
            console.error('Error refining step:', error);
            const stepName = steps[index].name || `Step ${index + 1}`;
            toast.error(`Failed to refine ${stepName}`);
        } finally {
            setRefiningStep(null);
        }
    };

    const handleAddStep = () => {
        const newStep = { ...DEFAULT_STEP };
        const newSteps = [...steps, newStep];
        setSteps(newSteps);
        onStepsChange(newSteps);
        setExpandedStep(newSteps.length - 1);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
        onStepsChange(newSteps);
        if (expandedStep === index) setExpandedStep(null);
    };

    const handleMoveStep = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= steps.length) return;
        const newSteps = [...steps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        setSteps(newSteps);
        onStepsChange(newSteps);
        setExpandedStep(newIndex);
    };

    return (
        <div className="h-[400px] space-y-4">
            <ScrollArea className="h-[87%] rounded-md px-3">
                <AnimatePresence>
                    {steps.map((step, index) => (
                        <div key={index} className="mb-4">
                            <div className="p-3 rounded-lg border bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 w-full">
                                        <Button variant="ghost" size="sm" onClick={() => setExpandedStep(expandedStep === index ? null : index)}>
                                            {expandedStep === index ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                        <Input value={step.name || ""} onChange={(e) => handleStepChange(index, { name: e.target.value })} placeholder="Step Name" className="flex-grow text-sm font-semibold" />
                                        <Button className="bg-transparent border-none" variant="outline" size="sm" onClick={() => handleRemoveStep(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveStep(index, "up")} disabled={index === 0}>
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveStep(index, "down")} disabled={index === steps.length - 1}>
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 relative"
                                                onClick={() => handleRefineStep(index)}
                                                disabled={refiningStep !== null}
                                            >
                                                <Sparkles className={`h-4 w-4 transition-opacity ${refiningStep === index ? 'opacity-0' : 'opacity-100'}`} />
                                                {refiningStep === index && (
                                                    <Loader2 className="h-4 w-4 animate-spin absolute inset-0 m-auto" />
                                                )}
                                            </Button>
                                            <Label className="text-xs sm:text-sm">Parameters</Label>
                                            <Switch checked={step.customParams} onCheckedChange={(checked) => handleStepChange(index, { customParams: checked })} />
                                            <Label className="text-xs sm:text-sm ml-4">Checkpoint</Label>
                                            <Switch checked={step.checkpoint} onCheckedChange={(checked) => handleStepChange(index, { checkpoint: checked })} />
                                        </div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedStep === index && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-4 mt-3">
                                            <Textarea value={step.prompt || ""} onChange={(e) => handleStepChange(index, { prompt: e.target.value })} placeholder="Enter the prompt for this step..." className="text-sm min-h-[99px] resize-y w-full" />
                                            
                                            {step.customParams && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 p-4 rounded-lg border bg-background/50">
                                                    <div className="space-y-2">
                                                        <Label>Model</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter model name (e.g., openai/gpt-4o, anthropic/claude-2)"
                                                            value={step.params?.model || ""}
                                                            onChange={(e) => handleParamChange(index, { model: e.target.value })}
                                                            className="font-mono"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label>Temperature</Label>
                                                            <span className="text-sm text-muted-foreground">{step.params?.temperature}</span>
                                                        </div>
                                                        <Slider
                                                            value={[step.params?.temperature || 0.7]}
                                                            min={0}
                                                            max={2}
                                                            step={0.1}
                                                            onValueChange={([value]) => handleParamChange(index, { temperature: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label>Top P</Label>
                                                            <span className="text-sm text-muted-foreground">{step.params?.topP}</span>
                                                        </div>
                                                        <Slider
                                                            value={[step.params?.topP || 0.9]}
                                                            min={0}
                                                            max={1}
                                                            step={0.1}
                                                            onValueChange={([value]) => handleParamChange(index, { topP: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label>Frequency Penalty</Label>
                                                            <span className="text-sm text-muted-foreground">{step.params?.frequencyPenalty}</span>
                                                        </div>
                                                        <Slider
                                                            value={[step.params?.frequencyPenalty || 0]}
                                                            min={-2}
                                                            max={2}
                                                            step={0.1}
                                                            onValueChange={([value]) => handleParamChange(index, { frequencyPenalty: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label>Presence Penalty</Label>
                                                            <span className="text-sm text-muted-foreground">{step.params?.presencePenalty}</span>
                                                        </div>
                                                        <Slider
                                                            value={[step.params?.presencePenalty || 0]}
                                                            min={-2}
                                                            max={2}
                                                            step={0.1}
                                                            onValueChange={([value]) => handleParamChange(index, { presencePenalty: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label>Max Tokens</Label>
                                                            <span className="text-sm text-muted-foreground">{step.params?.maxTokens}</span>
                                                        </div>
                                                        <Slider
                                                            value={[step.params?.maxTokens || 2048]}
                                                            min={1}
                                                            max={16000}
                                                            step={1}
                                                            onValueChange={([value]) => handleParamChange(index, { maxTokens: value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Stop Sequences</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(step.params?.stopSequences || []).map((seq, seqIndex) => (
                                                                <div key={seqIndex} className="flex items-center gap-1 bg-background/50 rounded px-2 py-1">
                                                                    <span className="text-sm">{seq}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-4 w-4 p-0"
                                                                        onClick={() => {
                                                                            const newSequences = (step.params?.stopSequences || []).filter((_, i) => i !== seqIndex);
                                                                            handleParamChange(index, { stopSequences: newSequences });
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Input
                                                                placeholder="Add stop sequence"
                                                                className="max-w-56 h-8 text-sm"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                                                        const newSequences = [...(step.params?.stopSequences || []), e.currentTarget.value];
                                                                        handleParamChange(index, { stopSequences: newSequences });
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </ScrollArea>
            <Button variant="outline" onClick={handleAddStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
            </Button>
        </div>
    );
}
