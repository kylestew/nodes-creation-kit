module.exports = (node, graph) => {
    const dataIn = node.in('data')
    const dataOutA = node.out('outA')
    const dataOutB = node.out('outB')

    const probability = node.in('probability', 0.5, { min: 0, max: 1})

    node.cook = () => {
        cookUp(node)

        let data = dataIn.value || { pts: [], geo: [] }
        let dataA = { pts: [], geo: [] }
        let dataB = { pts: [], geo: [] }

        const prob = probability.value

        // Track used points
        const usedPoints = new Set();

        // Split geo based on probability
        data.geo.forEach(geo => {
            if (Math.random() > prob) {
                // Add geo to dataA
                let newPtIndices = geo.pt_indices.map(idx => {
                    let pt = data.pts[idx];
                    usedPoints.add(idx);
                    return dataA.pts.push(pt) - 1;
                });
                dataA.geo.push({ pt_indices: newPtIndices, closed: geo.closed });
            } else {
                // Add geo to dataB
                let newPtIndices = geo.pt_indices.map(idx => {
                    let pt = data.pts[idx];
                    usedPoints.add(idx);
                    return dataB.pts.push(pt) - 1;
                });
                dataB.geo.push({ pt_indices: newPtIndices, closed: geo.closed });
            }
        });

        // Distribute points that are not used in any geometry
        data.pts.forEach((pt, idx) => {
            if (!usedPoints.has(idx)) {
                if (Math.random() > prob) {
                    dataA.pts.push(pt);
                } else {
                    dataB.pts.push(pt);
                }
            }
        });

        dataOutA.setValue(dataA);
        dataOutB.setValue(dataB);
        node.comment = `pts: ${dataA.pts.length}, geo: ${dataA.geo.length} || pts: ${dataB.pts.length}, geo: ${dataB.geo.length}`;
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
