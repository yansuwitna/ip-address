module.exports = {
  apps: [
    {
      name: 'ip-address',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3000',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
