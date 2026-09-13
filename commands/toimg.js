const sharp = require("sharp");
const pino = require("pino");
const { downloadMediaMessage } = require("@itsliaaa/baileys");
const { reactLoading, reactDone, reactError } = require("../utils/reactStatus");

module.exports = {
    name: "toimg",
    match: (text, msg) => {
        const isToimg = text.trim().toLowerCase() === "toimg";
        const quotedSticker = msg.message.extendedTextMessage?.contextInfo
            ?.quotedMessage?.stickerMessage;
        return isToimg && !!quotedSticker;
    },
    execute: async (sock, msg, from) => {
        try {
            await reactLoading(sock, from, msg);

            const contextInfo = msg.message.extendedTextMessage.contextInfo;
            const quotedSticker = contextInfo.quotedMessage.stickerMessage;

            const fakeMsg = {
                key: {
                    remoteJid: from,
                    id: contextInfo.stanzaId,
                    fromMe: false,
                    participant: contextInfo.participant,
                },
                message: { stickerMessage: quotedSticker },
            };

            const webpBuffer = await downloadMediaMessage(
                fakeMsg,
                "buffer",
                {},
                {
                    logger: pino({ level: "silent" }),
                    reuploadRequest: sock.updateMediaMessage,
                },
            );

            const pngBuffer = await sharp(webpBuffer).png().toBuffer();

            await sock.sendMessage(from, { image: pngBuffer }, { quoted: msg });
            await reactDone(sock, from, msg);
        } catch (err) {
            console.error(err);
            await reactError(sock, from, msg);
        }
    },
};
