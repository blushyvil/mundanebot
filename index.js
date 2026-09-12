const makeWASocket = require('baileys').default
const { useMultiFileAuthState, DisconnectReason } = require('baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const { Sticker } = require('wa-sticker-formatter')
const { downloadMediaMessage } = require('baileys')
const { bratGen } = require('brat-canvas')
const { bratVid } = require('brat-canvas/video')
const packageJson = require('./package.json')
const commands = ['ping', 'sticker', 'brat', 'bratgif']

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

        if (text.toLowerCase() === 'munp') {
            const start = Date.now()
            const latency = Date.now() - start

            const infoText = `pong!\n\n`+
            `latency: ${latency}ms\n`+
            `commands: ${commands.length}\n`+
            `version: ${packageJson.version}\n`+
            `developer: @blushyvil`

            await sock.sendMessage(from, { text: infoText })
            return
        }

        const caption = msg.message.imageMessage?.caption
        || msg.message.conversation
        || msg.message.extendedTextMessage?.text
        || ''

        if (msg.message.imageMessage && caption.toLowerCase() === 'muns') {
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
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
        }

        if (text.toLowerCase().startsWith('munbrat ')) {
            const bratText = text.slice(8)

            const imageBuffer = await bratGen(bratText, {
                C_BG: '#ffffff',
            })
             const sticker = new Sticker(imageBuffer, {
                pack: 'mundαne',
                author: '⠀ ⠀ ⠀❤︎',
                quality: 70
            })
            const stickerBuffer = await sticker.toBuffer()
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
        }

        if (text.toLowerCase().startsWith('munbg ')) {
            const bratText = text.slice(6)
            const videoBuffer = await bratVid(bratText, { outputFormat: 'gif' })

            const sticker = new Sticker(videoBuffer, {
             pack: 'mundαne',
                author: '⠀ ⠀ ⠀❤︎',
                quality: 70
            })
            const stickerBuffer = await sticker.toBuffer()
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
        }
        
    })
}

startbot()