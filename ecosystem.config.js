module.exports = {
  apps: [{
    name: 'jda-landingpage-mkt2',
    script: 'npm',
    args: 'start',
    cwd: '/root/jda-landingpage-mkt-2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3015,
      HOST: '158.247.207.5',
      NEXT_PUBLIC_BASE_URL: 'http://158.247.207.5:3015',
    },
    error_file: '/root/jda-landingpage-mkt-2/logs/err.log',
    out_file: '/root/jda-landingpage-mkt-2/logs/out.log',
    log_file: '/root/jda-landingpage-mkt-2/logs/combined.log',
    time: true
  }]
}; 