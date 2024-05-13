module.exports = (node, graph) => {
    const dataIn = node.in('data')

    node.in('RUN', run, { connectable: false })
    function run() {
        node.cook()

        console.log('[RUN]', dataIn.value)
    }

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                if (typeof port.source.node.cook === 'function') {
                    port.source.node.cook()
                }
            })
    }
}
