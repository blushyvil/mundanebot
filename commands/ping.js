const packageJson = require("../package.json");
const { getUptime, getUserCount } = require("../utils/stats");

module.exports = {
    name: "ping",
    match: (text) => text.toLowerCase() === "munp",
    execute: async (sock, msg, from, { commandCount }) => {
        const infoText = `pong!\n\n` +
            `commands: ${commandCount}\n` +
            `uptime: ${getUptime()}\n` +
            `users: ${getUserCount()}\n` +
            `version: ${packageJson.version}\n` +
            `developer: @blushyvil`;

        await sock.sendMessage(from, { text: infoText });
    },
};
