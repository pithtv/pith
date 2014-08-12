angular.module("PlayerControlModule", ["WsEventsModule"])
.factory("PlayerControlService", 
    ["$http", "WsEventsService",
     function($http, WsEventsService) {
    
    var players = [];
    var activePlayer = null;
    
    $http
        .get('/rest/players')
        .then(function(res) {
            var ts = new Date().getTime();
            players = res.data;
            players.forEach(function(e) {
                e.status.timestamp = ts;
            });
            
            if(!activePlayer) {
                activePlayer = players[0];
            }
            if(activePlayer) {
                service.emit("playerstatechange", activePlayer.status);
            }
        });
    
    var service = {
        getSelectedPlayer: function() {
            return activePlayer;
        },
        
        getAvailablePlayers: function() {
            return players;
        },
    
        selectPlayer: function(playerId) {
            activePlayer = players.filter(function(e) {
                return e.id === playerId;
            })[0];
            
            this.emit("playerstatechange", activePlayer.status);
        },
        
        load: function(channelId, itemId) {
            $http.get("/rest/player/" + activePlayer.id + "/load/" + channelId + "/" + itemId).error(modalHttpError);
        },
        
        play: function() {
            $http.get("/rest/player/" + activePlayer.id + "/play").error(modalHttpError);   
        },
        
        stop: function() {
            $http.get("/rest/player/" + activePlayer.id + "/stop").error(modalHttpError);   
        },
        
        pause: function() {
            $http.get("/rest/player/" + activePlayer.id + "/pause").error(modalHttpError);   
        }
    };
         

    for(var x in EventEmitter.prototype) {
        service[x] = EventEmitter.prototype[x];
    }
         
    WsEventsService.on("playerstatechange", function(playerId, status) {
        status.timestamp = new Date().getTime();
        players.filter(function(e) {
           return e.id = playerId; 
        })[0].status = status;
        if(playerId == activePlayer.id) {
            service.emit("playerstatechange", status);   
        }
    });
         
    setInterval(function() {
        var newTs = new Date().getTime();
        players.forEach(function(e) {
            var status = e.status;
            if(status.state.playing) {
                var tsDelta = (newTs - status.timestamp)/1000;
                status.timestamp = newTs;
                status.position.time += tsDelta;
            }
        });
        
        if(activePlayer) {
            service.emit("playerstatechange", activePlayer.status);
        }
    }, 200);
    
    return service;
}]);
                                              