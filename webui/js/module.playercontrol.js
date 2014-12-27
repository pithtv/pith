angular.module("PlayerControlModule", ["WsEventsModule"])
.factory("PlayerControlService", 
    ["$http", "WsEventsService", "$q",
        function($http, WsEventsService, $q) {
            var players = [];
            var activePlayer = null;

            function refreshPlayers() {
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
                    });
            }

            refreshPlayers();

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
                },

                load: function(channelId, itemId, time) {
                    return $http.get("/rest/player/" + activePlayer.id + "/load/" + channelId + "/" + itemId, {params: {time: time}}).error(modalHttpError);
                },

                play: function() {
                    return $http.get("/rest/player/" + activePlayer.id + "/play").error(modalHttpError);
                },

                stop: function() {
                    return $http.get("/rest/player/" + activePlayer.id + "/stop").error(modalHttpError);
                },

                pause: function() {
                    return $http.get("/rest/player/" + activePlayer.id + "/pause").error(modalHttpError);
                },

                seek: function(time) {
                    return $http.get("/rest/player/" + activePlayer.id + "/seek?time=" + Math.floor(time)).error(modalHttpError);
                },

                getLastPlayState: function(channelId, itemId) {
                    return $http.get("/rest/channel/playstate/" + channelId + "/" + itemId).error(modalHttpError);
                }
            };

            for(var x in EventEmitter.prototype) {
                service[x] = EventEmitter.prototype[x];
            }

            WsEventsService.on("playerstatechange", function(event) {
                var status = event.status, playerId = event.player.id;
                status.timestamp = new Date().getTime();
                var p = players.filter(function(e) {
                   return e.id === playerId;
                });
                if(p && p.length) p[0].status = status;
                if(activePlayer && playerId == activePlayer.id) {
                    service.emit("playerstatechange", status);
                }
            }).on("playerregistered", function(player) {
                players.push(player);
                if(!activePlayer) {
                    activePlayer = player;
                    service.emit("playerstatechange", status);
                }
                service.emit("playerlistchanged");
            }).on("playerdisappeared", function(player) {
                players = players.filter(function(e) {
                    return e.id !== player.id;
                });
                if(activePlayer && activePlayer.id === player.id) {
                    activePlayer = players[0];
                    service.emit("playerstatechange", status);
                }
                service.emit("playerlistchanged");
            });

            setInterval(function() {
                var newTs = new Date().getTime();
                players.forEach(function(e) {
                    var status = e.status;
                    if(status.state && status.state.playing) {
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
        }
    ]
);
                                              