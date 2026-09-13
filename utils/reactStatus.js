async function reactLoading(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
}

async function reactDone(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
}

async function reactError(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
}

module.exports = { reactLoading, reactDone, reactError };
