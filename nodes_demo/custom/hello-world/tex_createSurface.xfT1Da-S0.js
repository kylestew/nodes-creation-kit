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

module.exports = (node, graph) => {
    const dataOut = node.out('out')

    const width = node.in('width', 1000)
    const height = node.in('height', 1000)
    const range = node.in('range', [-1, 1])
    const clearColor = node.in('clearColor', [1, 1, 1, 1], { type: 'color' })

    const { getHex } = require('pex-color')

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })

        const w = width.value
        const h = height.value

        const offscreenCanvas = new OffscreenCanvas(w, h)
        const offCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true })
        if (!offCtx) {
            throw new Error('Could not create OffscreenCanvasRenderingContext2D')
        }

        offCtx.fillStyle = getHex(clearColor.value)
        offCtx.fillRect(0, 0, w, h)

        const rng = range.value
        setCanvasRange(offCtx, rng[0], rng[1])

        dataOut.setValue({ ctx: offCtx })
    }
}
