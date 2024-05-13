module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    const type = node.in("data type", "point", { type: "dropdown", values: ["point", "geo"] })
    const colorIn = node.in('color', [1, 1, 1, 1], { type: 'color' })

    const { getHex } = require('pex-color')

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }

        if (type.value == "point") {
            for (let pt of data.pts) {
                pt['color'] = getHex(colorIn.value)
            }
        } else {
            for (let pt of data.geo) {
                pt['color'] = getHex(colorIn.value)
            }
        }

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
