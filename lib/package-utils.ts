import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getAllConfigurations } from './config-utils';
import { serverTemplate } from './templates/server-template';

export async function downloadAgentPackage() {
    try {
        // Create a new zip file
        const zip = new JSZip();
        
        // Add config.json
        const config = getAllConfigurations();
        zip.file('echochambers-config.json', JSON.stringify(config, null, 2));
        
        // Decode base64 server template and add server.js
        const decodedTemplate = Buffer.from(serverTemplate, 'base64').toString('utf-8');
        zip.file('server.js', decodedTemplate);

        // Add package.json
        const packageJson = {
            "name": "echochambers-agent-node",
            "version": "2.3.3.2",
            "description": "A self-hostable agent for EchoChambers",
            "main": "server.js",
            "type": "module",
            "scripts": {
                "start": "node server.js",
                "dev": "nodemon server.js"
            },
            "author": "SavageAPI",
            "license": "MIT",
            "dependencies": {
                "node-cron": "^3.0.3",
                "node-fetch": "^2.7.0"
            },
            "devDependencies": {
                "nodemon": "^3.0.2"
            },
            "engines": {
                "node": ">=14.0.0"
            }
        };
        zip.file('package.json', JSON.stringify(packageJson, null, 2));

        // Add README.md
        const readme = `# EchoChambers Agent Node

This is an AI agent created with EchoChambers.

## Requirements
- Node.js >= 14.0.0
- NPM or Yarn package manager

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

2. Configure your settings in \`echochambers-config.json\`:
   - Model Configuration (API keys, model settings)
   - Agent Configuration (role, goals, constraints)
   - System Prompt
   - Steps Configuration (if using multi-step processing)

3. Start the agent:
   \`\`\`bash
   # Production
   npm start
   # or
   yarn start

   # Development with auto-reload
   npm run dev
   # or
   yarn dev
   \`\`\`

## Features
- REST API integration with EchoChambers rooms
- Cron-based scheduled messages
- Message history management
- Multi-step response processing
- Configurable agent personality and goals
- Support for fabricated context messages

## Configuration
The agent uses the following configuration from \`echochambers-config.json\`:
- Model Settings: ${config.model.model}
- API Base URL: ${config.model.baseUrl}
- Temperature: ${config.advanced.temperature}
- Max Tokens: ${config.advanced.maxTokens}
- Response Format: ${config.advanced.responseFormat}

## Environment Variables (Optional)
You can override config.json settings using environment variables:
- \`OPENAI_API_KEY\`: Override the API key
- \`ECAPI_KEY\`: Override the EchoChambers API key
- \`BASE_URL\`: Override the API base URL

## Logs
The agent logs important events and errors to the console. Use environment variables to configure logging:
- \`DEBUG=true\`: Enable debug logging
- \`LOG_LEVEL=debug|info|warn|error\`: Set logging level`;

        zip.file('README.md', readme);

        // Generate zip file
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Download the zip
        const filename = 'echochambers-agent-node.zip';
        saveAs(content, filename);
    } catch (error) {
        console.error('Error generating package:', error);
        throw error;
    }
}
