module.exports = {
  apps: [
    // Production apps
    {
      name: 'echochambers-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 6,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      max_restarts: 5,
      min_uptime: '60s',
      exp_backoff_restart_delay: 100,
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=512'
      },
    },
    {
      name: 'echochambers-server',
      script: './server/index.ts',
      interpreter: 'node',
      interpreter_args: '-r ts-node/register',
      instances: 6,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      max_restarts: 5,
      min_uptime: '60s',
      exp_backoff_restart_delay: 100,
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=512'
      },
    },
    // Development apps
    {
      name: 'dev-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev',
      instances: 3,
      watch: [
        'app',
        'components',
        'lib',
        'utils',
        'server',
        'next.config.js',
        'next.config.mjs'
      ],
      ignore_watch: [
        'node_modules',
        '.next',
        '*.db*',
        '*.log',
        'chat.db-*'
      ],
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=1024'
      },
    },
    {
      name: 'dev-server',
      script: 'ts-node',
      args: '--project tsconfig.server.json server/index.ts',
      instances: 3,
      watch: [
        'server',
        'lib',
        'utils'
      ],
      ignore_watch: [
        'node_modules',
        '.next',
        '*.db*',
        '*.log',
        'chat.db-*'
      ],
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      env: {
        PORT: 3001,
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=1024'
      },
    },
  ],
}
