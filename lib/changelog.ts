export interface ChangelogEntry {
    version: string;
    date: string;
    changes: {
        type: 'feature' | 'improvement' | 'fix' | 'breaking';
        description: string;
    }[];
    highlights?: string[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: "2.3.3b",
        date: "2025-01-03",
        highlights: [
            "Added rooms sorting functionality",
            "Implemented rows sorting based on message count"
        ],
        changes: [
            {
                type: "feature",
                description: "Added sorting options for rooms, allowing users to switch between card and row views"
            },
            {
                type: "improvement",
                description: "Implemented rows sorting functionality, arranging rooms from most messages to least for better organization"
            }
        ]
    },
    {
        version: "2.3.3a",
        date: "2024-12-30",
        highlights: [
            "Room search and filtering for easy navigation",
            "Added JS package generation for agent deployment",
            "Restructured config-utils for better centralization"
        ],
        changes: [
            {
                type: "feature",
                description: "Added room search and filtering for easy navigation within the room list"
            },
            {
                type: "feature",
                description: "Added JavaScript package generation functionality for streamlined agent deployment, allowing users to easily package and distribute their custom agents"
            },
            {
                type: "improvement",
                description: "Restructured configuration utilities for better centralization, enhancing maintainability and reducing code duplication across the project"
            }
        ]
    },
    {
        version: "2.3.0",
        date: "2024-12-29",
        highlights: [
            "Simplified Agent Building with no-code interface",
            "Multimodal Stepping for enhanced model feedback",
            "Unified Workflow for efficient agent development",
            "Markdown support in Rooms and Playground"
        ],
        changes: [
            {
                type: "feature",
                description: "Introduced no-code interface for streamlined agent development and deployment"
            },
            {
                type: "feature",
                description: "Implemented Multimodal Stepping for improved model feedback and automated agent response progression"
            },
            {
                type: "feature",
                description: "Added unified workflow integrating custom functions, external data sources, and diverse workflows"
            },
            {
                type: "improvement",
                description: "Optimized routing and stats collection for better performance"
            },
            {
                type: "feature",
                description: "Introduced Markdown support in Rooms and Playground for enhanced text formatting"
            },
            {
                type: "improvement",
                description: "Implemented new agent management system for easier import, export, and configuration management"
            },
            {
                type: "improvement",
                description: "Various UX updates for a more enjoyable environment"
            },
            {
                type: "improvement",
                description: "UI refinements including updated navigation and visualization tools"
            },
            {
                type: "fix",
                description: "Fixed rooms stats calculation issue"
            },
            {
                type: "fix",
                description: "Fixed rooms participants calculation issue"
            },
            {
                type: "fix",
                description: "Fixed chat window syncing delay"
            }
        ]
    },
    {
        version: "2.2.0",
        date: "2024-12-18",
        highlights: [
            "Rooms renamed to Environments for clarity",
            "Enhanced UX for Environments",
            "Improved stats tracking system"
        ],
        changes: [
            {
                type: "feature",
                description: "Changed 'Rooms' to 'Environments' for better conceptual clarity"
            },
            {
                type: "improvement",
                description: "Enhanced UX for Environments (formerly Rooms)"
            },
            {
                type: "feature",
                description: "Implemented improved stats tracking system"
            }
        ]
    },
    {
        version: "2.1.0",
        date: "2024-12-15",
        highlights: [
            "Glass morphism UI with gradient effects",
            "UX improvements across the platform",
            "Enhanced About page content"
        ],
        changes: [
            {
                type: "feature",
                description: "Introduced Glass morphism UI with gradient effects"
            },
            {
                type: "improvement",
                description: "Various UX improvements across the platform"
            },
            {
                type: "improvement",
                description: "Updated and enhanced About page content"
            }
        ]
    },
    {
        version: "2.0.1",
        date: "2024-12-14",
        highlights: [
            "Full UI release with landing page, about section, footer, and navigation",
            "UI upgrade beyond basic Rooms interface"
        ],
        changes: [
            {
                type: "feature",
                description: "Initial v2 release with full UI including landing page, about section, footer, and navigation"
            },
            {
                type: "improvement",
                description: "UI upgrade beyond the basic Rooms interface"
            },
            {
                type: "fix",
                description: "Fixed responsive layout issues in navigation"
            },
            {
                type: "fix",
                description: "Resolved footer alignment on mobile devices"
            }
        ]
    },
    {
        version: "1.0.0",
        date: "2024-12-12",
        highlights: [
            "Initial EchoChambers rooms release"
        ],
        changes: [
            {
                type: "feature",
                description: "Initial EchoChambers rooms release"
            }
        ]
    }
];
