const makeWASocket = require('baileys').default
const { useMultiFileAuthState, DisconnectReason } = require('baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const { Sticker } = require('wa-sticker-formatter')
const { downloadMediaMessage } = require('baileys')
const { bratGen } = require('brat-canvas')
const { bratVid } = require('brat-canvas/video')

async function startbot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr  } = update

        if (qr) {
            console.log('QR RECEIVED! scan this:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection lost! reconnecting...', shouldReconnect)
            if (shouldReconnect) startbot()
        } else if (connection === 'open') {
    console.log('mundane connected!')
}
    })

    sock.ev.on('messages.upsert', async (m) => {

        const { messages, type } = m
        if (type !== 'notify') return 

        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const from = msg.key.remoteJid

        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, {text: 'pong!'})
            return
        }

        const caption = msg.message.imageMessage?.caption || ''
        if (msg.message.imageMessage && caption.toLowerCase() === 'munsi') {
            const buffer = await downloadMediaMessage(
                msg,
                'buffer',
                {},
                {
                    logger: pino({ level: 'silent' }),
                    reuploadRequest: sock.updateMediaMessage
                }
            )
            const sticker = new Sticker(buffer, {
                pack: 'mundαne',
                author: '⠀ ⠀ ⠀❤︎',
                quality: 70
            })
            const stickerBuffer = await sticker.toBuffer()
            await sock.sendMessage(from, { sticker: stickerBuffer })
        }

        if (text.toLowerCase().startsWith('mbrat')) {
            const bratText = text.slice(6)

            const imageBuffer = await bratGen(bratText, {
                C_BG: '#ffffff',
            })
             const sticker = new Sticker(imageBuffer, {
                pack: 'mundαne',
                author: '⠀ ⠀ ⠀❤︎',
                quality: 70
            })
            const stickerBuffer = await sticker.toBuffer()
            await sock.sendMessage(from, { sticker: stickerBuffer })
        }

        if (text.toLowerCase().startsWith('bratgif ')) {
            const bratText = text.slice(8)
            const videoBuffer = await bratVid(bratText, { outputFormat: 'gif' })

            const sticker = new Sticker(videoBuffer, {
             pack: 'mundαne',
                author: '⠀ ⠀ ⠀❤︎',
                quality: 70
            })
            const stickerBuffer = await sticker.toBuffer()
            await sock.sendMessage(from, { sticker: stickerBuffer })
        }
        
    })
}

startbot()