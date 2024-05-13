module.exports = (node, graph) => {
    const dataOut = node.out('out')

    const centerPt = node.in('centerPt', [0, 0])
    const width = node.in('width', 2, { min: 0.01 })
    const height = node.in('height', 2, { min: 0.01 })
    const rows = node.in("rows", 10, {precision: 0, min: 1})
    const cols = node.in("cols", 10, {precision: 0, min: 1})

    node.cook = () => {
        let data = {
            pts: [],
            geo: []
        }

        const center = centerPt.value
        const w = width.value
        const h = height.value
        const r = rows.value + 1
        const c = cols.value + 1

        // Calculate the starting point (bottom-left corner of the grid)
        const startX = center[0] - w / 2;
        const startY = center[1] - h / 2;

        // Calculate the spacing between points
        const xSpacing = w / (c - 1);
        const ySpacing = h / (r - 1);

        // Generate points in a grid
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                const x = startX + j * xSpacing;
                const y = startY + i * ySpacing;
                data.pts.push({x, y});
            }
        }

        // Connect grid points as rectangles using indices
        for (let i = 0; i < r - 1; i++) {
            for (let j = 0; j < c - 1; j++) {
                const topLeft = i * c + j;
                const topRight = i * c + (j + 1);
                const bottomLeft = (i + 1) * c + j;
                const bottomRight = (i + 1) * c + (j + 1);

                // Add the rectangle as a closed polygon
                data.geo.push({
                    pt_indices: [topLeft, topRight, bottomRight, bottomLeft],
                    closed: true
                });
            }
        }

        dataOut.setValue(data)
        node.comment = `pts: ${data.pts.length}, geo: ${data.geo.length}`
    }
}
