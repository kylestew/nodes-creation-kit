module.exports = (node, graph) => {
    const dataIn = node.in('data')

    // manage canvas
    const canvas = document.createElement('canvas')
    graph.sceneContainer.appendChild(canvas)
    node.onDestroy = () => {
        if (canvas) {
            canvas.remove()
        }
    }

    // live loop start/stop
    const liveCheckbox = node.in('live', false, { connectable: false })
    let isLive = liveCheckbox.value
    liveCheckbox.onChange = (val) => {
        isLive = val
        node.comment = ''
        if (isLive) {
            requestAnimationFrame(liveLoop)
            node.comment = 'running'
        }
    }
    function liveLoop() {
        if (isLive) {
            node.cook()

            setTimeout(() => {
                requestAnimationFrame(liveLoop)
            }, 1000)
        }
    }

    // cook up network and display output
    node.in(
        'RUN',
        () => {
            node.cook()
        },
        { connectable: false }
    )
    node.cook = () => {
        cookUp(node)

        if (dataIn.value === undefined) return

        if (dataIn.value.ctx != null) {
            // TEX context
            const offscreenCanvas = dataIn.value.ctx.canvas
            canvas.width = offscreenCanvas.width
            canvas.height = offscreenCanvas.height

            const ctx = canvas.getContext('2d')

            ctx.drawImage(offscreenCanvas, 0, 0)
        } else {
            // GEO context
            canvas.width = 800
            canvas.height = 800
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, 800, 800)

            // Determine the bounds of all points
            const pts = dataIn.value.pts
            let minX = Infinity,
                maxX = -Infinity,
                minY = Infinity,
                maxY = -Infinity
            pts.forEach((pt) => {
                if (pt.x < minX) minX = pt.x
                if (pt.x > maxX) maxX = pt.x
                if (pt.y < minY) minY = pt.y
                if (pt.y > maxY) maxY = pt.y
            })
            let min = Math.min(minX, minY)
            let max = Math.max(maxX, maxY)
            let range = max - min
            setCanvasRange(ctx, min - range * 0.1, max + range * 0.1)

            drawDebugGeometry(ctx, dataIn.value, range * 0.005)
        }
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

function drawDebugGeometry(ctx, data, pointMarkerSize = 0.01) {
    const pts = data.pts
    const polys = data.geo

    // Draw Cartesian grid
    drawCartesianGrid(ctx, pointMarkerSize / 2.0)

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
        ctx.moveTo(pts[idx].x, pts[idx].y)
        for (let i = 1; i < geo.pt_indices.length; i++) {
            idx = geo.pt_indices[i]
            ctx.lineTo(pts[idx].x, pts[idx].y)
        }
        // if (geo.closed) {
        //     // apply style attribs (or defaults)
        //     ctx.fillStyle = geo.color ?? '#000000'
        //     ctx.fill()
        // } else {
        // apply style attribs (or defaults)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = pointMarkerSize / 2.0
        ctx.stroke()
        // }
    }

    // for every point, draw a marker
    for (const pt of pts) {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pointMarkerSize, 0, 2 * Math.PI)
        ctx.fillStyle = '#00ff00'
        ctx.fill()
        ctx.closePath()
    }
}

function drawCartesianGrid(ctx, lineWidth, scale = 1) {
    const majorSpacing = 1 * scale;   // Major ticks every 1 unit
    const minorSpacing = 0.2 * scale; // Minor ticks every 0.1 unit
    const range = 2 * scale;          // Grid extends from -2 to +2 units

    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = lineWidth / 2.0;

    // // Draw minor grid (dashed lines)
    ctx.setLineDash([0.01, 0.01]); // Sets the dashed line pattern
    for (let x = -range; x <= range; x += minorSpacing) {
        drawLine(ctx, x, -range, x, range); // vert
        drawLine(ctx, -range, x, range, x); // horiz
    }

    // Draw major grid (solid lines)
    ctx.setLineDash([]); // Resets to solid lines
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ccc'; // Major lines are darker
    for (let x = -range; x <= range; x += majorSpacing) {
        drawLine(ctx, x, -range, x, range); // vert
        drawLine(ctx, -range, x, range, x); // horiz
    }

    // Central Axis
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#fff'; // Major lines are darker
    for (let x = -range; x <= range; x += majorSpacing) {
        drawLine(ctx, 0, -range, 0, range); // vert
        drawLine(ctx, -range, 0, range, 0); // horiz
    }
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function setCanvasRange(ctx, min, max) {
    // Retrieve the canvas dimensions from the context
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    // Determine the shortest side
    const size = Math.min(width, height)

    // Calculate the scale factor to fit [min, max] into the shortest side
    const scaleFactor = size / (max - min)

    // Reset transformations to default
    ctx.resetTransform()

    // Set up scaling
    ctx.scale(scaleFactor, scaleFactor)

    // Initialize translation values
    let translateX = 0
    let translateY = 0

    let excessWidth = 0
    let excessHeight = 0

    let xRange = [min, max]
    let yRange = [min, max]

    // Determine if width or height is the shortest dimension and calculate translation
    if (size === width) {
        // Width is the shortest, center vertically
        excessHeight = height - width
        translateY = excessHeight / (2 * scaleFactor)
        ctx.translate(-min, -min + translateY)

        // Update yRange to reflect the actual range being displayed
        const rescaleFactor = height / (max - min) / scaleFactor
        yRange = [min * rescaleFactor, max * rescaleFactor]
    } else {
        // Height is the shortest, center horizontally
        excessWidth = width - height
        translateX = excessWidth / (2 * scaleFactor)
        ctx.translate(-min + translateX, -min)

        // Update yRange to reflect the actual range being displayed
        const rescaleFactor = width / (max - min) / scaleFactor
        xRange = [min * rescaleFactor, max * rescaleFactor]
    }

    // Return new ranges describing how the canvas area is being used
    return {
        min: [xRange[0], yRange[0]],
        max: [xRange[1], yRange[1]],
    }
}
