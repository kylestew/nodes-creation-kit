module.exports = (node, graph) => {
    const dataIn0 = node.in('data0')
    const dataIn1 = node.in('data1')
    const dataOut = node.out('out')

    node.cook = () => {
        cookUp(node)
        
        let data = { pts: [], geo: [] }
        let data0 = dataIn0.value || { pts: [], geo: [] }
        let data1 = dataIn1.value || { pts: [], geo: [] }


        // Merge 'pts' arrays from data0 and data1
        data.pts = [...data0.pts, ...data1.pts];

        // Adjust 'geo' indices from data1 and merge 'geo' arrays
        let offset = data0.pts.length; // Offset is the size of data0.pts
        let adjustedGeoData1 = data1.geo.map(geo => ({
            ...geo,
            pt_indices: geo.pt_indices.map(index => index + offset)
        }));
        data.geo = [...data0.geo, ...adjustedGeoData1];

        dataOut.setValue(data);
        node.comment = `pts: ${data.pts.length}, geo: ${data.geo.length}`;
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
