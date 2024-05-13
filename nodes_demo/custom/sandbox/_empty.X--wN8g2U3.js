module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    const width = node.in('width', 1, { min: 0.01 })
    const height = node.in('height', 1, { min: 0.01 })
    const colorIn = node.in('color', [1, 0, 0, 1], { type: 'color' })

    const { getHex } = require('pex-color')

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }

        // make a colored square
        const w = width.value
        const h = height.value

        data.pts.push({ x: -1, y: -1 })
        data.pts.push({ x: -1, y: 1 })
        data.pts.push({ x: 1, y: 1 })
        data.pts.push({ x: 1, y: -1 })
        data.geo.push({
            pt_indices: [0, 1, 2, 3],
            closed: true,
            color: getHex(colorIn.value),
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
