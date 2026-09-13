const sharp = require('sharp')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const { flush } = require('../utils/albumBuffer')

module.exports = {
    name: 'stickerpack',
    match: (text) => text.trim().toLowerCase().startsWith('munpack'),
    execute: async (sock, msg, from, { text }) => {
        const raw = text.replace(/munpack\s*/i, '').trim()

        // pisah berdasarkan "|" -> [nama, description]
        const [rawName, rawDesc] = raw.split('|').map(s => s?.trim())

        const packName = rawName || 'mundαne pack'
        const description = rawDesc || 'made with mundαne'

        const buffers = flush(from)

        if (buffers.length === 0) {
            await sock.sendMessage(from, { text: 'please send the pic first before using munpack!' })
            return
        }

        const webpBuffers = await Promise.all(buffers.map(toWebp))
        const tempPaths = await Promise.all(webpBuffers.map(bufferToTempFile))

        try {
            await sock.sendMessage(from, {
                cover: { url: tempPaths[0] },
                stickers: tempPaths.map(p => ({ data: { url: p } })),
                name: packName,
                publisher: '⠀ ⠀ ⠀♥︎⠀ ⠀ ⠀',
                description: description
            })
        } finally {
            await Promise.all(tempPaths.map(p => fs.unlink(p).catch(() => {})))
        }
    }
}