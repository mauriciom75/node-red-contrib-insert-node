module.exports = function(RED) {
    function waitPathsNode(config) {
        RED.nodes.createNode(this,config);

        this.toWires = JSON.parse(config.paths);

        var node = this;
        
        node.on('input', function(msg) {
            
            //node.error("insert-node timeout!", msg);
            var oldWires = node.wires;

            // obtengo el nodo al cual saltar
            var toNode = RED.nodes.getNode(node.toWires);

            // el proximo nodo será el nodo al cual quiero saltar.
            node.updateWires(node.toWires);
            
            // el nodo al cual salto, tiene que ccontinuar a partir de los siguientes.
            toNode.updateWires(oldWires);

            node.send(msg);
            
        });
    }
    RED.nodes.registerType("insert-node",waitPathsNode);
}
