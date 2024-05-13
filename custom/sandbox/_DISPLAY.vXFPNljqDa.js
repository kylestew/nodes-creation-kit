module.exports = (node, graph) => {
    const dataIn = node.in('data')

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    graph.sceneContainer.appendChild(canvas);

	node.onDestroy = () => {
		if (canvas) {
			canvas.remove();
		}
	};

    node.in('RUN', () => { node.cook() }, { connectable: false })
    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })


        const offscreenCanvas = dataIn.value.ctx.canvas
        canvas.width = offscreenCanvas.width
        canvas.height = offscreenCanvas.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Canvas not supported in this browser!')
        }

        ctx.drawImage(offscreenCanvas, 0, 0)
    }
}
