module.exports = (node, graph) => {
    const dataOut = node.out('out')

    const startX = node.in("startX", 0)
    const endX = node.in("endX", 1)
    const startY = node.in("startY", 0)
    const endY = node.in("endY", 1)
    const stepX = node.in("stepX", 0.25, { min: 0.01})
    const stepY = node.in("stepY", 0.25, {min: 0.01})

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })

        let data = {
            pts: [],
            geo: []
        }

        for (let y = startY.value; y < endY.value; y += stepY.value) {
            for (let x = startX.value; x < endX.value; x += stepX.value) {
                data.pts.push([x, y])
            }
        }

        dataOut.setValue(data)
    }
}
