module.exports = {
    apps: [
        {
            name: "vitasang-api",
            script: "index.js",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 8000,
            },
        },
    ],
};
