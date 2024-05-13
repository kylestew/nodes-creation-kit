module.exports = (node, graph) => {
    const dataOut = node.out('out')

    const centerPt = node.in('centerPt', [0, 0])
    const width = node.in('width', 1, { min: 0.01 })
    const height = node.in('height', 1, { min: 0.01 })
    const closedToggle = node.in('closed', true)

    node.cook = () => {
        let data = { pts: [], geo: [] }

        // make a colored square
        const pt = centerPt.value
        const w = width.value
        const h = height.value
        const closed = closedToggle.value

        const a = {x: -w/2 + pt[0], y: -h/2 - pt[1]}
        const b = {x: w/2 + pt[0], y: h/2 - pt[1]}

        data.pts.push({ x: a.x, y: a.y })
        data.pts.push({ x: b.x, y: a.y })
        data.pts.push({ x: b.x, y: b.y })
        data.pts.push({ x: a.x, y: b.y })
        if (closed == false) data.pts.push({ x: a.x, y: a.y })
        data.geo.push({
            pt_indices: closed ? [0, 1, 2, 3] : [0, 1, 2, 3, 4],
            closed
        })

        dataOut.setValue(data)
        node.comment = `pts: ${data.pts.length}, geo: ${data.geo.length}`
    }
}
