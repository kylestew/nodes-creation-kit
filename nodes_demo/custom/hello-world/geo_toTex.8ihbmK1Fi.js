module.exports = (node, graph) => {
    const geoData = node.in('geoData')
    const texData = node.in('texData')
    const texOut = node.out('out')

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })

        const ctx = texData.value.ctx
        const geo_data = geoData.value
        console.log(geo_data)

        // for every geo instance, draw it
        for (const geo of geo_data.geo) {
            if (geo.pt_indices.length == 0) {
                console.error('degraded polygon, no points to draw')
                continue
            }
            if (geo.pt_indices.length < 2) {
                // draw a point?
                throw new Error('did you mean to draw a point?')
            }
            if (geo.closed) {
                throw new Error('filled polygons not supported')
            }

            // apply style attribs (or defaults)
            ctx.strokeStyle = geo.color ?? '#000000'

            // draw polyline
            let idx = geo.pt_indices[0]
            ctx.moveTo(geo_data.pts[idx].x, geo_data.pts[idx].y)
            for (let i = 1; i < geo.pt_indices.length; i++) {
                idx = geo.pt_indices[i]
                ctx.lineTo(geo_data.pts[idx].x, geo_data.pts[idx].y)
                console.log(geo_data.pts[idx].x, geo_data.pts[idx].y)
            }
            ctx.stroke()
        }

        texOut.setValue(texData.value)
    }
}
