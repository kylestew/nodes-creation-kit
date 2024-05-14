module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    // doing this in code so we can refernce the dynamic rows variable
    // basically we are creating an expression
    const rows = node.in("rows", 10, {precision: 0, min: 1})

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }

        const scale = 1.0 / rows.value
        data.pts.forEach(pt => {
            pt.scale = scale
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
