module.exports = function(RED) {
    function waitPathsNode(config) {
        RED.nodes.createNode(this,config);

        this.wires = JSON.parse(config.paths);

        var node = this;
        
        node.on('input', function(msg) {
            
            //node.error("insert-node timeout!", msg);
            var wires = this.wires;

            var toNode = RED.nodes.getNode(id);

            node.updateWires(wires);
            
            
            toNode.updateWires(wires);

            node.send(node.pathsContol[correlationId].main_msg);
            
        });
    }
    RED.nodes.registerType("insert-node",waitPathsNode);
}
