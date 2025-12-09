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
      HOST: '45.77.249.188',
      NEXT_PUBLIC_BASE_URL: 'http://45.77.249.188:3015',
      AIRTABLE_API_KEY: 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231',
      AIRTABLE_BASE_ID: 'app0YMWSt1LtrGu7S',
      AIRTABLE_TABLE_ID: 'tblP52B81ccH8jICa',
      CALENDLY_PERSONAL_ACCESS_TOKEN: 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ',
      CALENDLY_USER_URI: 'https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96'
    },
    error_file: '/root/jda-landingpage-mkt-2/logs/err.log',
    out_file: '/root/jda-landingpage-mkt-2/logs/out.log',
    log_file: '/root/jda-landingpage-mkt-2/logs/combined.log',
    time: true
  }]
}; 