module.exports = function(RED) {

    var table = {};

    function insertNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.toWires = {};//JSON.parse(config.paths);
        //this.varName = JSON.parse(config.paths);
        this.varName = config.paths;

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            if (node.primeraPasada)
            {
                node.primeraPasada = false;
                //node.error("insert-node timeout!", msg);
                console.log("old wires:" + JSON.stringify(node.wires) );
                //var oldWires = node.wires;
                // guardo original
                table[node.varName].original_wires = node.wires; 

                // el proximo nodo será el nodo al cual quiero saltar.
                node.updateWires(table[node.varName].wires);

                // si es un solo nodo, ya actualizo el return.
                if (!table[node.varName].esPath)
                {

                    var toNode = RED.nodes.getNode(table[node.varName].wires);

                    // el nodo al cual salto, tiene que ccontinuar a partir de los siguientes.
                    toNode.updateWires(table[node.varName].original_wires);

                }
                
            }
            node.send(msg);
            
        });
    }
    function returnNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.varName = config.paths;

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            if (node.primeraPasada)
            {
                node.primeraPasada = false;

                // el proximo nodo será el nodo al cual quiero saltar.
                node.updateWires(table[node.varName].original_wires);
                
            };
            node.send(msg);
            
        });
    }
    function declareNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.varName = config.paths;
        this.esPath = Number(config.timeout);

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            if (node.primeraPasada)
            {
                node.primeraPasada = false;

                aux_wires = [node.wires[1]];
                // en la segunda salida está el nodo a declarar
                console.log("declare wires:" + JSON.stringify(aux_wires) );

                //node.context.flow.set("nodeTo",node.wires);
                table[node.varName] = {};
                table[node.varName].wires = aux_wires;
                table[node.varName].esPath = node.esPath;

            }
            node.send([msg]);
            
        });
    }
    RED.nodes.registerType("insert-node",insertNodeNode);
    RED.nodes.registerType("return-node",returnNodeNode);
    RED.nodes.registerType("declare-node",declareNodeNode);
}
