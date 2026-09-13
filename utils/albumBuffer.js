const pending = new Map() // key: from -> array of buffers

function addImage(from, buffer) {
    if (!pending.has(from)) pending.set(from, [])
    pending.get(from).push(buffer)
}

function flush(from) {
    const buffers = pending.get(from) || []
    pending.delete(from)
    return buffers
}

module.exports = { addImage, flush }