module.exports = (node, graph) => {
    const geoData = node.in('geoData')
    const texData = node.in('texData')
    const texOut = node.out('out')

    node.cook = () => {
        cookUp(node)

        const ctx = texData.value.ctx
        let data = geoData.value || { pts: [], geo: [] }

        drawGeometry(ctx, data)

        texOut.setValue(texData.value)
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

function drawGeometry(ctx, data, drawPoints = false) {
    const pts = data.pts
    const polys = data.geo

    // for every geo instance, draw it
    for (const geo of polys) {
        if (geo.pt_indices.length == 0) {
            console.error('degraded polygon, no points to draw')
            continue
        }
        if (geo.pt_indices.length < 2) {
            // draw a point?
            throw new Error('did you mean to draw a point?')
        }

        // draw polyline
        let idx = geo.pt_indices[0]
        ctx.beginPath()
        ctx.moveTo(pts[idx].x, pts[idx].y)
        for (let i = 1; i < geo.pt_indices.length; i++) {
            idx = geo.pt_indices[i]
            ctx.lineTo(pts[idx].x, pts[idx].y)
        }
        if (geo.closed) {
            ctx.closePath()
            // apply style attribs (or defaults)
            ctx.fillStyle = geo.color ?? '#000000'
            ctx.fill()
        } else {
            // apply style attribs (or defaults)
            ctx.lineWidth = geo.weight ?? 0.01
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.strokeStyle = geo.color ?? '#000000'
            ctx.stroke()
        }
    }

    // for every point, draw a marker
    if (drawPoints) {
    for (const pt of pts) {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 0.01, 0, 2 * Math.PI)
        ctx.fillStyle = '#000000'
        ctx.fill()
        ctx.closePath()
    }
    }
}
