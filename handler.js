const fs = require('fs')
const path = require('path')

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'))
const commands = commandFiles.map(file => require(`./commands/${file}`))

module.exports = commands