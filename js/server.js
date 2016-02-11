/**
 * Created by Anders on 2016-02-11.
 */
var wsServer = require('ws').Server;

var webSocketServer = new wsServer({port: 3434});

webSocketServer.broadcast = function(data) {
    for(var i in this.clients){
        this.clients[i].send(data);
    }
};

webSocketServer.on('connection', function(ws){
    webSocketServer.on('message', function(message) {
        console.log('received: %s', message);
        webSocketServer.broadcast(message);
    });
});