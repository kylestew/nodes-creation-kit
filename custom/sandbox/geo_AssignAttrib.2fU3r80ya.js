module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    const type = node.in("data type", "point", { type: "dropdown", values: ["point", "geo"] })

    const floatName = node.in('float name', "")
    const floatIn = node.in('float value', 1.0, { min: 0.0001, precision: 4 })

    node.cook = () => {
        cookUp(node)
        let data = dataIn.value || { pts: [], geo: [] }

        for (let thing of type.value == "point" ? data.pts : data.geo) {
            if (floatName.value != "") {
                thing[floatName.value] = floatIn.value
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
