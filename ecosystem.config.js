module.exports = {
  apps: [{
    name: 'simt-mts',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/home/z/my-project',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1024',
    },
    max_memory_restart: '512M',
    max_restarts: 15,
    restart_delay: 3000,
    watch: false,
    autorestart: true,
  }]
};
