const pino = require('pino')
const { downloadMediaMessage } = require('@itsliaaa/baileys')
const { addImage } = require('../utils/albumBuffer')

module.exports = {
    name: 'collectimage',
    match: (text, msg) => !!msg.message.imageMessage,
    execute: async (sock, msg, from) => {
        const buffer = await downloadMediaMessage(
            msg, 'buffer', {},
            { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
        )
        addImage(from, buffer)
    }
}