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
                //console.log("old wires:" + JSON.stringify(node.wires) );
                //var oldWires = node.wires;
                // guardo original
                node.original_wires = node.wires;
            }

            // msg.insertNode[node.varName].original_wires = node.original_wires; 

            // no hay declarado un path. salgo por el default ( salida 2).
            if ( msg.insertNode[node.varName].call_wires[0].length != 0  )
            {

                console.log("realizo el jump");
                // el proximo nodo será el nodo al cual quiero saltar.
                node.updateWires(msg.insertNode[node.varName].call_wires);


                if (!msg.insertNode)
                    msg.insertNode = {};
                if (!msg.insertNode.stack)
                    msg.insertNode.stack = [];

                // en el mensaje dejo en un stack la dirección de respuesta.
                msg.insertNode.stack.push({original_wires:node.original_wires});

                node.send([msg,null]);
            }
            else
            {
                console.log("no realizo el jump");
                node.send([null,msg]);
            }
        });
    }
    function returnNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.varName = config.paths;

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            node.primeraPasada = false;


            var original_wires = msg.insertNode.stack[msg.insertNode.stack.length - 1].original_wires;
            //console.log("return original_wires:" + JSON.stringify(msg.insertNode[node.varName].original_wires) );
            // el proximo nodo será el nodo al cual quiero saltar.

            node.updateWires(original_wires);


            node.send(msg);
            
        });
    }
    function declareNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.salidas = config.salidas;
        this.esPath = Number(config.timeout);

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            node.primeraPasada = false;

            // en la segunda salida está el nodo a declarar
            //console.log("declare wires:" + JSON.stringify(aux_wires) );

            //node.context.flow.set("nodeTo",node.wires);
            //table[node.varName] = {};
            //table[node.varName].wires = aux_wires;
            //table[node.varName].esPath = node.esPath;

            if (!msg.insertNode) msg.insertNode = {};

            for (var i = 1 ; i < node.salidas.length ; i++)
            {
                varName = node.salidas[i];
                aux_wires = [node.wires[i]];

                msg.insertNode[varName] = {};
                msg.insertNode[varName].call_wires = aux_wires;
                msg.insertNode[varName].esPath = node.esPath;
            }

            node.send([msg]); // envio por la salida 1
            
        });
    }
    function catchNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.varName = config.paths;

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            node.primeraPasada = false;

            
            //console.log("return original_wires:" + JSON.stringify(msg.insertNode[node.varName].original_wires) );
            // el proximo nodo será el nodo al cual quiero saltar.
//            if (msg.error) msg.insertNode[node.varName].error = msg.error;
//            if (msg._error) msg.insertNode[node.varName]._error = msg._error;

            if (msg.error) msg.insertNode.stack[msg.insertNode.stack.length - 1].error = msg.error;
            if (msg._error) msg.insertNode.stack[msg.insertNode.stack.length - 1]._error = msg._error;


            node.send(msg);
            
        });
    }
    function throwNodeNode(config) {
        RED.nodes.createNode(this,config);

        this.varName = config.paths;

        var node = this;
        node.primeraPasada = true;
        
        node.on('input', function(msg) {
            
            node.primeraPasada = false;

            var aux = msg.insertNode.stack.pop();

            if ( aux.error )
            //if (msg.insertNode[node.varName].error)
            {
                //node.error(msg.insertNode[node.varName].error.message, msg);
                node.error(aux.error.message, msg);
            }
            else
            {
                node.send(msg);
            }
            
        });
    }    
    RED.nodes.registerType("insert-node",insertNodeNode);
    RED.nodes.registerType("return-node",returnNodeNode);
    RED.nodes.registerType("declare-node",declareNodeNode);
    RED.nodes.registerType("catch-node",catchNodeNode);
    RED.nodes.registerType("throw-node",throwNodeNode);
}
