/**
 * Created by Anders on 2016-02-11.
 */

var WebSocketServer = require('ws').Server;


//Create a websocket server on port 3434
var wss = new WebSocketServer({port: 3434});

//A broadcast function. Broadcasts the message to all connected clients
wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});

/*
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
});*/