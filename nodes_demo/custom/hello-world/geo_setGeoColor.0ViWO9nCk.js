module.exports = (node, graph) => {
    const dataIn = node.in("data");
    const dataOut = node.out("out");

    const colorIn = node.in("color", [1, 1, 1, 1], { type: "color" });

    const { getHex } = require("pex-color");

    node.cook = () => {
        node.ports
            .filter((port) => port.dir === 0 && port.source != null)
            .forEach((port) => {
                port.source.node.cook()
            })
    }
};