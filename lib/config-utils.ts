import { STORAGE_KEYS } from "./constants";
import { ModelConfig, AgentConfig, StepPrompt, Function, Message } from "@/components/sections/playground/types";

// Default values for the model configuration
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
    ecapiKey: "",
    apiKey: "",
    baseUrl: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    responseFormat: "text",
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    stream: false,
    enableScheduling: false,
    scheduleType: "manual",
    maxRuns: 1,
    cronExpression: "",
    retryStrategy: "none",
    enableBatch: false,
    batchSize: 1,
    concurrency: 1,
    debugMode: false,
};

// Default values for advanced settings
export const DEFAULT_ADVANCED_CONFIG = {
    responseFormat: "text",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    stream: false,
};

// Default values for the package configuration
export const DEFAULT_PACKAGE_CONFIG = {
    botName: "EC_Bot",
    roomURL: "http://echochambers.art:3001/api/rooms",
    roomName: "general",
    cronSchedule: "1 * * * *",
    historyLimit: "9",
    responseWeightedDecision: "0.5",
};

// Default values for agent configuration
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
    role: "",
    goals: "",
    constraints: "",
    memory: false
};

// Default values for fabrications
export const DEFAULT_FABRICATIONS: Message[] = [];

// Default values for functions
export const DEFAULT_FUNCTIONS: Function[] = [];

// Default values for steps
export const DEFAULT_STEP_PARAMS = {
    model: "",
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    maxTokens: 2000,
    stopSequences: []
};

export const DEFAULT_STEP: StepPrompt = {
    name: "",
    prompt: "",
    checkpoint: false,
    customParams: false,
    params: DEFAULT_STEP_PARAMS
};

export const DEFAULT_STEPS: StepPrompt[] = [];

// Default values for template
export const DEFAULT_TEMPLATE = "";

// Default values for system prompt
export const DEFAULT_SYSTEM_PROMPT = "";

interface ConfigData {
    package: {
        botName: string;
        roomURL: string;
        roomName: string;
        cronSchedule: string;
        historyLimit: string;
        responseWeightedDecision: string;
    };
    model: ModelConfig;
    advanced: {
        responseFormat: string;
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        stopSequences: string[];
        stream: boolean;
    };
    systemPrompt: string;
    template: string;
    agent: AgentConfig;
    steps: StepPrompt[];
    fabrications: Message[];
    functions: Function[];
}

export function getAllConfigurations(): ConfigData {
    const getStorageItem = <T>(key: string, defaultValue: T): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error parsing ${key}:`, error);
            return defaultValue;
        }
    };

    const modelConfig = getStorageItem(STORAGE_KEYS.MODEL_CONFIG, DEFAULT_MODEL_CONFIG);
    const advancedConfig = getStorageItem(STORAGE_KEYS.ADVANCED_CONFIG, DEFAULT_ADVANCED_CONFIG);
    const packageConfig = getStorageItem(STORAGE_KEYS.PACKAGE_CONFIG, DEFAULT_PACKAGE_CONFIG);
    const systemPrompt = getStorageItem(STORAGE_KEYS.SYSTEM_PROMPT, DEFAULT_SYSTEM_PROMPT);
    const template = getStorageItem(STORAGE_KEYS.TEMPLATE_CONFIG, DEFAULT_TEMPLATE);
    const agent = getStorageItem(STORAGE_KEYS.AGENT_CONFIG, DEFAULT_AGENT_CONFIG);
    const steps = getStorageItem(STORAGE_KEYS.STEPS_CONFIG, DEFAULT_STEPS);
    const fabrications = getStorageItem(STORAGE_KEYS.FABRICATIONS, DEFAULT_FABRICATIONS);
    const functions = getStorageItem(STORAGE_KEYS.FUNCTION_CONFIG, DEFAULT_FUNCTIONS);

    return {
        package: packageConfig,
        model: modelConfig,
        advanced: advancedConfig,
        systemPrompt,
        template,
        agent,
        steps,
        fabrications,
        functions,
    };
}

export function downloadConfigFile() {
    const config = getAllConfigurations();
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "echochambers-config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
