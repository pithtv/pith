angular.module("WsEventsModule", []).factory("WsEventsService", function() {
    
    var ws;
    var retryInterval = 3000;
    var wsEvents = {};
    
    var url = "ws://localhost:3334/";
    
    var listeners = {};
    
    var client = {
        ready: false,
        
        on: function(event, callback) {
            if(!listeners[event]) {
                listeners[event] = [];
                if(this.ready) {
                    ws.registerEvent(event);
                }
            }
            listeners[event].push(callback);
        }
    }
    
    function connect() {
        console.log("Trying to connect to event server: " + url);
        ws = new WebSocket(url);
        ws.registerEvent = function(event) {
            ws.send(JSON.stringify({action: 'on', event: event}));
        }
        ws.onopen = function() {
            console.log("Event server connection successful!");
            client.ready = true;
            for(var event in listeners) {
                ws.registerEvent(event);
            }
        }
        ws.onmessage = function(data) {
            console.debug("Received event " + data.data);
            var evt = JSON.parse(data.data);
            console.log(evt);
            this.trigger(evt.event, evt.arguments);
        };
        ws.trigger = function(event, args) {
            if(listeners[event]) {
                listeners[event].forEach(function(h) {
                    h.apply(this, args); 
                });
            }
        };
        ws.onclose = function() {
            console.log("Connection to event server lost");
            client.ready = false;
            setTimeout(connect, retryInterval);
        };
    }
    
    connect();
    
    return client;
});