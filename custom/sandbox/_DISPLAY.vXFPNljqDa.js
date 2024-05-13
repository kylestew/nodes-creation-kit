module.exports = (node, graph) => {
    const dataIn = node.in('data')

    // manage canvas
    const canvas = document.createElement('canvas')
    graph.sceneContainer.appendChild(canvas)
    node.onDestroy = () => {
        if (canvas) {
            canvas.remove()
            dataDiv.remove()
        }
    }

    // manage data output div
    const dataDiv = document.createElement('div')
    dataDiv.style.color = 'white'
    graph.sceneContainer.appendChild(dataDiv)

    // live loop start/stop
    const liveCheckbox = node.in('live', false, { connectable: false })
    let isLive = liveCheckbox.value
    liveCheckbox.onChange = (val) => {
        isLive = val
        if (isLive) {
            requestAnimationFrame(liveLoop)
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

        dataDiv.innerHTML = ''

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
            const data = dataIn.value
            dataDiv.innerHTML = JSON.stringify(data, null, 2)
            console.log(data)
        }

        const currentTime = new Date().getTime()
        node.comment = `${currentTime} ms`
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
