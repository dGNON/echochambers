import { ModelConfig } from "@/components/sections/playground/types";
import { STORAGE_KEYS } from "./constants";

interface PromptResponse {
    content: string;
}

const REFINE_PROMPT = `### Enhanced Prompt Requirements
To generate high-quality content, the prompt must meet the following criteria:
* Maintain the core purpose and intent of the original content
* Improve clarity and precision by avoiding vague terms and ensuring concise language
* Add necessary constraints and guidelines to narrow down the scope
* Ensure comprehensive coverage of edge cases and potential exceptions
* Remove redundancy and ambiguity to prevent confusion
* Maintain coherence and cohesiveness throughout the content
* Adapt the style and tone based on the field title (e.g., [Agent Role], [Agent Goals], etc.)

### Field-Specific Guidelines
* [Agent Role]: Focus on clear, actionable responsibilities and capabilities
* [Agent Goals]: Structure goals in a clear, prioritized manner with measurable outcomes
* [Agent Constraints]: Define clear boundaries and limitations while maintaining flexibility
* [System Prompt]: Enhance the core instructions while maintaining the original intent
* [Template]: Preserve template variables ({{...}}) while improving structure

### Response Guidelines
Provide a well-formatted response that meets the above requirements, without including any explanations, metadata, or the field title in the response.`;

async function makePromptRequest(prompt: string): Promise<PromptResponse> {
    let modelConfig: ModelConfig;
    
    try {
        const storedConfig = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
        modelConfig = storedConfig ? JSON.parse(storedConfig) : null;
        
        if (!modelConfig?.baseUrl || !modelConfig?.apiKey) {
            throw new Error('Model configuration not found');
        }
    } catch (error) {
        throw new Error('Failed to load model configuration');
    }

    const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${modelConfig.apiKey}`,
        },
        body: JSON.stringify({
            model: modelConfig.model,
            messages: [
                { role: "system", content: REFINE_PROMPT },
                { role: "user", content: REFINE_PROMPT },
                { role: "user", content: "Always maintain a well-formatted prompt. Use bullet points, numbered lists, or clear sections to organize information. Ensure consistent indentation and spacing for improved readability." },
                { role: "user", content: "The prompt is used to generate content for the relevant topic. The prompt should meet the requirements of the topic." },
                { role: "user", content: `Here's the prompt to improve:\n\n${prompt}` }
            ],
            temperature: 0.6, // Lower temperature for more focused improvements
            max_tokens: 8888,
            top_p: 1,
            frequency_penalty: 0.12,
            presence_penalty: 0.12,
        }),
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        content: data.choices[0].message.content
    };
}

export async function refinePrompt(prompt: string): Promise<string> {
    try {
        const response = await makePromptRequest(prompt);
        return response.content;
    } catch (error) {
        console.error('Error refining prompt:', error);
        throw error;
    }
}
