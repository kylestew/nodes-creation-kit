module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    const type = node.in("data type", "point", { type: "dropdown", values: ["point", "geo"] })

    const colorIn = node.in('color', [1, 1, 1, 1], { type: 'color' })
    const assignColor = node.in('set color', false)

    const weightIn = node.in('weight', 0.01, { min: 0.0001 })
    const assignWeight = node.in('set weight', false)

    const { getHex } = require('pex-color')

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }

        for (let thing of type.value == "point" ? data.pts : data.geo) {
            if (assignColor.value == true) {
                thing.color = getHex(colorIn.value)
            }
            if (assignWeight.value == true) {
                thing.weight = weightIn.value
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
