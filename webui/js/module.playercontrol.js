angular.module("PlayerControlModule", ["WsEventsModule", "errorDialogModule", "pith.restApi"])
.factory("PlayerControlService", 
    ["$pithRest", "WsEventsService", "$q", "modalHttpError",
        function($pithRest, WsEventsService, $q, modalHttpError) {
            "use strict";

            var players = [];
            var activePlayer = null;
            var activePlayerInterface;

            function refreshPlayers() {
                $pithRest.players()
                    .then(function(res) {
                        var ts = new Date().getTime();
                        players = res.data;
                        players.forEach(function(e) {
                            e.status.timestamp = ts;
                        });

                        if(!activePlayer) {
                            service.setActivePlayer(players[0]);
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
                    this.setActivePlayer(players.filter(function(e) {
                        return e.id === playerId;
                    })[0]);
                },

                setActivePlayer: function(player) {
                    activePlayer = player;
                    activePlayerInterface = player && $pithRest.player(player.id);
                },

                load: function(channelId, itemId, time) {
                    return activePlayerInterface.load(channelId, itemId, {params: {time: time}}).error(modalHttpError);
                },

                play: function() {
                    return activePlayerInterface.play().error(modalHttpError);
                },

                stop: function() {
                    return activePlayerInterface.stop().error(modalHttpError);
                },

                pause: function() {
                    return activePlayerInterface.pause().error(modalHttpError);
                },

                seek: function(time) {
                    return activePlayerInterface.seek({time: Math.floor(time)}).error(modalHttpError);
                },

                getLastPlayState: function(channelId, itemId) {
                    return $pithRest.channel(channelId).playstate(itemId).error(modalHttpError);
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
            }).on("playerregistered", function(event) {
                var player = event.player;
                players.push(player);
                if(!activePlayer) {
                    service.setActivePlayer(player);
                    service.emit("playerstatechange", status);
                }
                service.emit("playerlistchanged");
            }).on("playerdisappeared", function(event) {
                var player = event.player;
                players = players.filter(function(e) {
                    return e.id !== player.id;
                });
                if(activePlayer && activePlayer.id === player.id) {
                    service.setActivePlayer(players[0]);
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
                                              