const { bratVid } = require('brat-canvas/video')
const { makeSticker } = require('../utils/sticker')

module.exports = {
    name: 'bratgif',
    match: (text) => text.toLowerCase().startsWith('munbg '),
    execute: async (sock, msg, from, { text }) => {
        const bratText = text.slice(6)
        const videoBuffer = await bratVid(bratText, { outputFormat: 'gif' })
        const stickerBuffer = await makeSticker(videoBuffer)
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
    }
}