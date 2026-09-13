const pino = require("pino");
const { downloadMediaMessage } = require("@itsliaaa/baileys");
const { addImage } = require("../utils/albumBuffer");

async function handleImageMessage(sock, msg, from) {
    if (!msg.message.imageMessage) return;

    const buffer = await downloadMediaMessage(
        msg,
        "buffer",
        {},
        {
            logger: pino({ level: "silent" }),
            reuploadRequest: sock.updateMediaMessage,
        },
    );
    addImage(from, buffer);
}

module.exports = { handleImageMessage };
