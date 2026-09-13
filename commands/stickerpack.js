const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { Sticker } = require("wa-sticker-formatter");
const { flush } = require("../utils/albumBuffer");
const { reactLoading, reactDone, reactError } = require("../utils/reactStatus");

async function toWebp(buffer, packName, author) {
    let quality = 80;
    let output = await new Sticker(buffer, {
        pack: packName,
        author: author,
        quality,
    }).toBuffer();

    while (output.length > 100 * 1024 && quality > 10) {
        quality -= 15;
        output = await new Sticker(buffer, {
            pack: packName,
            author: author,
            quality,
        }).toBuffer();
    }
    return output;
}

async function bufferToTempFile(buffer) {
    const filePath = path.join(
        os.tmpdir(),
        `mundane_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`,
    );
    await fs.writeFile(filePath, buffer);
    return filePath;
}

module.exports = {
    name: "stickerpack",
    match: (text) => text.trim().toLowerCase().startsWith("munpack"),
    execute: async (sock, msg, from, { text }) => {
        await reactLoading(sock, from, msg);

        try {
            const raw = text.replace(/munpack\s*/i, "").trim();
            const [rawName, rawDescription] = raw.split("|").map((s) =>
                s?.trim()
            );
            const packName = rawName || "⠀ ⠀ ⠀♥︎⠀ ⠀ ⠀";
            const description = rawDescription || "made with mundαne!";
            const author = "﹫blushyvil";

            const buffers = flush(from);

            if (buffers.length < 3) {
                await sock.sendMessage(from, {
                    text:
                        `3 pic min for munpack! (you sent ${buffers.length}).`,
                });
                await reactError(sock, from, msg);
                return;
            }

            if (buffers.length > 30) {
                await sock.sendMessage(from, {
                    text: `30 pic max! (you sent ${buffers.length}).`,
                });
                await reactError(sock, from, msg);
                return;
            }

            const webpBuffers = await Promise.all(
                buffers.map((b) => toWebp(b, packName, author)),
            );
            const tempPaths = await Promise.all(
                webpBuffers.map(bufferToTempFile),
            );

            try {
                await sock.sendMessage(from, {
                    cover: { url: tempPaths[0] },
                    stickers: tempPaths.map((p) => ({ data: { url: p } })),
                    name: packName,
                    publisher: author,
                    description: description,
                });
                await reactDone(sock, from, msg);
            } finally {
                await Promise.all(
                    tempPaths.map((p) => fs.unlink(p).catch(() => {})),
                );
            }
        } catch (err) {
            console.error(err);
            await reactError(sock, from, msg);
        }
    },
};
