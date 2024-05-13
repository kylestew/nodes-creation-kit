module.exports = (node, graph) => {
    const out = node.out("value")
    const value = node.in('row cols', 8, { precision: 0, min: 1, max: 64})
    value.onChange = (val) => {
        out.setValue(val)
        node.comment = val
    };
};