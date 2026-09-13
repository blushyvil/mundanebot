const pino = require("pino");
const { downloadMediaMessage } = require("@itsliaaa/baileys");
const { makeSticker } = require("../utils/sticker");
const { reactLoading, reactDone, reactError } = require("../utils/reactStatus");

module.exports = {
    name: "sticker",
    match: (text, msg) => {
        const caption = msg.message.imageMessage?.caption ||
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";
        return !!msg.message.imageMessage && caption.toLowerCase() === "muns";
    },
    execute: async (sock, msg, from, { sockRef }) => {
        try {
            await reactLoading(sock, from, msg);

            const buffer = await downloadMediaMessage(
                msg,
                "buffer",
                {},
                {
                    logger: pino({ level: "silent" }),
                    reuploadRequest: sockRef.updateMediaMessage,
                },
            );
            const stickerBuffer = await makeSticker(buffer);
            await sock.sendMessage(from, { sticker: stickerBuffer }, {
                quoted: msg,
            });

            await reactDone(sock, from, msg);
        } catch (err) {
            console.error(err);
            await reactError(sock, from, msg);
        }
    },
};
