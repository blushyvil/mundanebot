const { Sticker } = require('wa-sticker-formatter')

async function makeSticker(buffer) {
    const sticker = new Sticker(buffer, {
        pack: 'mundαne',
        author: '⠀ ⠀ ⠀❤︎',
        quality: 70
    })
    return sticker.toBuffer()
}

module.exports = { makeSticker }