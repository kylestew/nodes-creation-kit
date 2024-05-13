module.exports = (node, graph) => {
    const dataGeo = node.in('geo');
    const dataPts = node.in('points');
    const dataOut = node.out('out');

    node.cook = () => {
        cookUp(node);
        
        let data = { pts: [], geo: [] };
        let geoData = dataGeo.value || { pts: [], geo: [] };
        let ptData = dataPts.value || { pts: [], geo: [] };

        // for every point in the point stream
        for (let pt of ptData.pts) {
            // copy every geo instance in the geo stream
            for (let geo of geoData.geo) {
                // for each point in geo instance
                let newPtIndices = [];
                for (let idx of geo.pt_indices) {
                    const scale = pt.scale || 1.0;
                    const angle = pt.angle || 0; // assuming angle is in degrees
                    
                    // scale
                    let newPt = scalePt(geoData.pts[idx], scale);

                    // rotate
                    newPt = rotatePt(newPt, angle);

                    // translate
                    newPt = addPt(newPt, pt);

                    newPtIndices.push(data.pts.push(newPt) - 1);
                }
                // add the new geo instance to the outgoing stream
                data.geo.push({ pt_indices: newPtIndices, closed: geo.closed });
            }
        }

        dataOut.setValue(data);
        node.comment = `pts: ${data.pts.length}, geo: ${data.geo.length}`;
    };
};

const addPt = (pt0, pt1) => ({x: pt0.x + pt1.x, y: pt0.y + pt1.y});
const scalePt = (pt, scale) => ({x: pt.x * scale, y: pt.y * scale});
const rotatePt = (pt, angle) => {
    const rad = angle * (Math.PI / 180); // convert angle to radians
    return {
        x: pt.x * Math.cos(rad) - pt.y * Math.sin(rad),
        y: pt.x * Math.sin(rad) + pt.y * Math.cos(rad)
    };
};

function cookUp(node) {
    node.ports
        .filter((port) => port.dir === 0 && port.source != null)
        .forEach((port) => {
            if (typeof port.source.node.cook === 'function') {
                port.source.node.cook();
            }
        });
}
