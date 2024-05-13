module.exports = (node, graph) => {
  const dataOut = node.out("data");

  const aIn = node.in("a", [0, 0])
  const bIn = node.in("b", [1, 1])

  // any chages to UI must cause a new value to be set on output port
  aIn.onChange = emit
  bIn.onChange = emit

  function emit() {
    let data = {
      pts: [],
      geo: []
    }

    data.pts.push(aIn.value)
    data.pts.push(bIn.value)
    data.geo.push({
      pt_indices: [0, 1],
      closed: false
    })

    dataOut.setValue(data)
  }

  node.onReady = () => {
    emit()
  };
};