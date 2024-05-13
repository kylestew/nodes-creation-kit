module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    node.cook = () => {
        cookUp(node)
        dataOut.setValue(dataIn.value)
    }
}

function cookUp(node) {
    node.ports
        .filter((port) => port.dir === 0 && port.source != null)
        .forEach((port) => {
            if (typeof port.source.node.cook === 'function') {
                port.source.node.cook()
            }
        })
}
