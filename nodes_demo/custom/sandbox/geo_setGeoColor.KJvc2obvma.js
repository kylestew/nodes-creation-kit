module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    const colorIn = node.in('color', [1, 1, 1, 1], { type: 'color' })

    const { getHex } = require('pex-color')

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })

        let data = dataIn.value
        for (let pt of data.geo) {
            pt["color"] = getHex(colorIn.value)
        }
    
        dataOut.setValue(data)
    }
}
