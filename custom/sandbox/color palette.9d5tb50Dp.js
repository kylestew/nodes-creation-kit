module.exports = (node, graph) => {
    const colorA = node.in('colorA', [1, 1, 1, 1], { type: 'color' })
    const colorB = node.in('colorB', [1, 1, 1, 1], { type: 'color' })
    const colorC = node.in('colorC', [1, 1, 1, 1], { type: 'color' })

    const outA = node.out("outA")
    const outB = node.out("outB")
    const outC = node.out("outC")

    colorA.onChange = (val) => outA.setValue(val)
    colorB.onChange = (val) => outB.setValue(val)
    colorC.onChange = (val) => outC.setValue(val)
};