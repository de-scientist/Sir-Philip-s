module.exports = {
  apps: [
    {
      name: 'sir-phillip-api',
      script: 'index.js',
      instances: 'max', // Use max for auto-detect based on CPU cores
      exec_mode: 'cluster', // Run in cluster mode for load balancing
      watch: false, // Don't watch for file changes in production
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Log configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/sir-philip/pm2-error.log',
      out_file: '/var/log/sir-philip/pm2-out.log',
      merge_logs: true,
      // Performance metrics
      node_args: '--max-old-space-size=1536', // Increase memory limit for Node.js
      // Graceful shutdown
      kill_timeout: 3000, // Give app 3 seconds to handle connections before killing
      wait_ready: true, // Wait for app to send 'ready' signal
      listen_timeout: 10000, // Wait 10 seconds for app to start
      // Restart behavior
      restart_delay: 3000, // Wait 3 seconds between restarts
      max_restarts: 10, // Max 10 restarts in case of issues
      // Cron restart (optional - restarts app daily at 4 AM for clean state)
      cron_restart: '0 4 * * *',
      // Auto-exit if app becomes unresponsive
      exp_backoff_restart_delay: 100,
      // Metrics retention
      trace: true, // Record application metrics
      // Deep monitoring (optional - requires PM2 Plus)
      deep_monitoring: false,
      // Error handling
      source_map_support: true
    }
  ],

  // Deployment configuration with PM2 deploy
  deploy: {
    production: {
      user: 'node',
      host: 'api.sirphillipranch.com',
      ref: 'origin/main',
      repo: 'git@github.com:de-scientist/Sir-Philip-s.git',
      path: '/home/lenny/web/sirphillipranch.com/public_html/sir-philip',
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'npm ci && npm run build && npm run prisma:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install -g pm2'
    }
  }
};
