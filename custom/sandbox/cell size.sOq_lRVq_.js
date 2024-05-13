module.exports = (node, graph) => {
    const out = node.out("value")
    const cellSize = node.in('cellSize', 0.25, { min: 0.01})
    cellSize.onChange = (val) => {
        out.setValue(val)
        node.comment = val
    };
};