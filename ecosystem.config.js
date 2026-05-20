module.exports = {
  apps: [
    {
      name: "vitasang-api",
      script: "index.js",
      cwd: "/app",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "512M",
      exp_backoff_restart_delay: 100,
      kill_timeout: 5000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: "production",
        PORT: 10000,
      },
      error_file: "/var/log/pm2-error.log",
      out_file: "/var/log/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
