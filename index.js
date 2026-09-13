const makeWASocket = require('@itsliaaa/baileys').default
const { useMultiFileAuthState, DisconnectReason } = require('@itsliaaa/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const commands = require('./handler')

async function startbot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

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

        for (const command of commands) {
            if (command.match(text, msg)) {
                await command.execute(sock, msg, from, {
                    text,
                    commandCount: commands.length,
                    sockRef: sock
                })
                break
            }
        }
    })
}

startbot()