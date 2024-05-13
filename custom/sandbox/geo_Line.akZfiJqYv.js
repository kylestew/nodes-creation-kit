module.exports = (node, graph) => {
    const dataOut = node.out('out')

    const aIn = node.in('a', [0, 0])
    const bIn = node.in('b', [1, 1])

    node.cook = () => {
        cookUp(node)

        let data = {
            pts: [],
            geo: [],
        }

        const pt0 = aIn.value
        const pt1 = bIn.value

        data.pts.push({ x: pt0[0], y: pt0[1] })
        data.pts.push({ x: pt1[0], y: pt1[1] })
        data.geo.push({
            pt_indices: [0, 1],
            closed: false,
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
