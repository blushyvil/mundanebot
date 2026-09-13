const startTime = Date.now();
const activeUsers = new Set();

function trackUser(jid) {
    activeUsers.add(jid);
}

function getUptime() {
    const diff = Date.now() - startTime;
    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / 60000) % 60;
    const h = Math.floor(diff / 3600000) % 24;
    const d = Math.floor(diff / 86400000);
    return `${d}h ${h}j ${m}m ${d}d`;
}

function getUserCount() {
    return activeUsers.size;
}

module.exports = { trackUser, getUptime, getUserCount };
