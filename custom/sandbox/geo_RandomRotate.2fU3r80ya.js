module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    node.cook = () => {
        cookUp(node)
        let data = dataIn.value || { pts: [], geo: [] }

        data.pts.forEach(pt => {
            if (Math.random() < 0.5) {
                pt.rotate = Math.PI / 2.0
            }
        })

        dataOut.setValue(data)
        node.comment = `pts: ${data.pts.length}, geo: ${data.geo.length}`
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
