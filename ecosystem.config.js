module.exports = {
  apps: [
    {
      name: "vitasang-api",
      script: "index.js",
      cwd: "/app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },
      error_file: "/var/log/pm2-error.log",
      out_file: "/var/log/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};