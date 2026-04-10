module.exports = {
    apps: [
        {
            name: "vitasang-api",
            script: "index.js",
            instances: "max",
            exec_mode: "cluster",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 8000,
            },
        },
    ],
};
