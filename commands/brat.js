const { bratGen } = require('brat-canvas')
const { makeSticker } = require('../utils/sticker')

module.exports = {
name: 'brat',
match: (text) => text.toLowerCase().startsWith('munbrat '),
execute: async (sock, msg, from, { text }) => {
const bratText = text.slice(8)
const imageBuffer = await bratGen(bratText, { C_BG: '#ffffff' })
const stickerBuffer = await makeSticker(imageBuffer)
await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
}
}