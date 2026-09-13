const { generateIQC } = require("iqc-canvas");
const { reactLoading, reactDone, reactError } = require("../utils/reactStatus");

function getMessageText(message) {
    return message?.conversation ||
        message?.extendedTextMessage?.text ||
        message?.imageMessage?.caption ||
        "";
}

module.exports = {
    name: "iqc",
    match: (text) => text.toLowerCase().startsWith("muniqc "),
    execute: async (sock, msg, from, { text }) => {
        const chatText = text.slice(7).trim();
        await reactLoading(sock, from, msg);

        try {
            if (!chatText) {
                await sock.sendMessage(from, {
                    text: "isi pesannya dong, contoh: muniqc lagi ngapain",
                }, { quoted: msg });
                return;
            }

            const now = new Date();
            const time = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });

            const contextInfo = msg.message.extendedTextMessage?.contextInfo;
            const quotedMessage = contextInfo?.quotedMessage;

            const options = {
                reactionEmojis: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🤦"],
                showPlusBtn: true,
            };

            if (quotedMessage) {
                options.reply = {
                    sender: contextInfo.participant?.split("@")[0] ||
                        "Seseorang",
                    text: getMessageText(quotedMessage),
                };
            }

            const result = await generateIQC(chatText, time, options);

            await sock.sendMessage(from, { image: result.image }, {
                quoted: msg,
            });
            await reactDone(sock, from, msg);
        } catch (err) {
            console.error(err);
            await reactError(sock, from, msg);
        }
    },
};
