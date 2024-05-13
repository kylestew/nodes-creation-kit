module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOut = node.out('out')

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }

        // for each primitive (geo)
        const centers = data.geo.map(geo => {
            // find the centroid
            const sum = geo.pt_indices.reduce((acc, idx) => {
                return {
                    x: acc.x + data.pts[idx].x,
                    y: acc.y + data.pts[idx].y
                };
            }, { x: 0, y: 0 });
            const avg = {
                x: sum.x / geo.pt_indices.length,
                y: sum.y / geo.pt_indices.length
            };
            
            return avg
        });

        // data stream out is just point centers
        data = { pts: centers, geo: [] }

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
