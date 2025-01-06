"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Code, FileJson, Settings2, Share2, Database, History } from "lucide-react";
import { ModelConfig } from "../../types";
import { downloadConfigFile, DEFAULT_PACKAGE_CONFIG } from "@/lib/config-utils";
import { downloadAgentPackage } from "@/lib/package-utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
    packageConfig?: {
        botName: string;
        roomURL: string;
        roomName: string;
        cronSchedule: string;
        historyLimit: string;
        responseWeightedDecision: string;
    };
    onPackageConfigChange?: (config: any) => void;
}

export function SettingsTab({ modelConfig, onModelConfigChange, packageConfig: externalPackageConfig = DEFAULT_PACKAGE_CONFIG, onPackageConfigChange = () => {} }: SettingsTabProps) {
    const [packageConfig, setPackageConfig] = useLocalStorage(STORAGE_KEYS.PACKAGE_CONFIG, externalPackageConfig);

    const handlePackageConfigChange = (updates: Partial<typeof packageConfig>) => {
        const newConfig = { ...packageConfig, ...updates };
        setPackageConfig(newConfig);
        onPackageConfigChange(newConfig);
    };

    const handleGenerateConfig = () => {
        try {
            downloadConfigFile();
            toast.success("Configuration file generated successfully");
        } catch (error) {
            console.error("Error generating config:", error);
            toast.error("Failed to generate configuration file");
        }
    };

    const handleDownloadPackage = async () => {
        try {
            await downloadAgentPackage();
            toast.success("Agent package downloaded successfully");
        } catch (error) {
            console.error("Error downloading package:", error);
            toast.error("Failed to download agent package");
        }
    };

    return (
        <div className="space-y-6">
            {/* Agent Settings */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Agent Development</h3>
                    <p className="text-sm text-muted-foreground">Configure agent executable package</p>
                </div>

                <Card className="p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Bot Name</Label>
                            <input type="text" placeholder="Enter bot name" value={packageConfig.botName} onChange={(e) => handlePackageConfigChange({ botName: e.target.value })} className="w-full p-2 bg-background/50 border border-input rounded-md text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Room URL</Label>
                            <input type="text" placeholder="Enter room URL" value={packageConfig.roomURL} onChange={(e) => handlePackageConfigChange({ roomURL: e.target.value })} className="w-full p-2 bg-background/50 border border-input rounded-md text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Room Name</Label>
                            <input type="text" placeholder="Enter room name" value={packageConfig.roomName} onChange={(e) => handlePackageConfigChange({ roomName: e.target.value })} className="w-full p-2 bg-background/50 border border-input rounded-md text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Run Schedule</Label>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={packageConfig.cronSchedule}
                                    onValueChange={(value) => handlePackageConfigChange({ cronSchedule: value })}
                                    defaultValue="* * * * *"
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="* * * * *">Every minute</SelectItem>
                                        <SelectItem value="*/2 * * * *">Every 2 minutes</SelectItem>
                                        <SelectItem value="*/3 * * * *">Every 3 minutes</SelectItem>
                                        <SelectItem value="*/5 * * * *">Every 5 minutes</SelectItem>
                                        <SelectItem value="*/15 * * * *">Every 15 minutes</SelectItem>
                                        <SelectItem value="0 * * * *">Hourly</SelectItem>
                                        <SelectItem value="0 */6 * * *">Every 3 hours</SelectItem>
                                        <SelectItem value="0 0 * * *">Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toast.info("Cron schedules define when the bot runs automatically.")}
                                >
                                    ?
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">History Limit</Label>
                            <input type="text" placeholder="Number of messages to return" value={packageConfig.historyLimit} onChange={(e) => handlePackageConfigChange({ historyLimit: e.target.value })} className="w-full p-2 bg-background/50 border border-input rounded-md text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Response Weighted Decision</Label>
                            <p className="text-xs text-muted-foreground">Post/Reply. Higher = more likely to post.</p>
                            <input type="text" min="0" max="1" placeholder="Value between 0.0 and 1.0" value={packageConfig.responseWeightedDecision} onChange={(e) => handlePackageConfigChange({ responseWeightedDecision: e.target.value })} className="w-full p-2 bg-background/50 border border-input rounded-md text-sm" />
                        </div>
                    </div>
                </Card>

                <Separator className="bg-border/50" />

                <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateConfig}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Generate Config File
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPackage}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as JS Package
                    </Button>
                    {/* <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export as Python Package
                    </Button> */}
                </div>

                <Separator className="bg-border/50" />

                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm">Debug Mode</Label>
                            <p className="text-xs text-muted-foreground">Show detailed execution logs</p>
                        </div>
                        <Switch
                            checked={modelConfig.debugMode}
                            onCheckedChange={(checked) =>
                                onModelConfigChange({
                                    ...modelConfig,
                                    debugMode: checked,
                                })
                            }
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
