angular
    .module("pith.restApi", [])
    .factory("$pithRest", ["$http", function($http) {
        var apiRoot = '/rest';

        function Module() {
            var args = Array.prototype.slice.apply(arguments, [0,-1]);
            var skel = Array.prototype.slice.apply(arguments, [-1])[0];

            function constructor(path) {
                this.root = path;
            }

            constructor.prototype = skel;

            return function() {
                var path = Array.prototype.slice.apply(arguments);
                return new constructor(this.root ? this.root.concat(path) : path);
            }
        }

        function apiurl() {
            return [apiRoot].concat(Array.prototype.slice.apply(arguments)).join("/");
        }

        function call(method) {
            var path = Array.prototype.slice.apply(arguments, [1]);
            return function() {
                var query,args;
                if(typeof arguments[arguments.length-1] === 'object') {
                    query = arguments[arguments.length-1];
                    args = Array.prototype.slice.apply(arguments, [0,-1]);
                } else {
                    query = null;
                    args = Array.prototype.slice.apply(arguments);
                }
                var url = [apiRoot].concat(path).concat(args).join("/") + "/";

                return $http[method](url, {params: query});
            }
        }

        function noempty(delegate) {
            return function() {
                var args = [];
                for(var x=0,l=arguments.length;x<l;x++) {
                    var argument = arguments[x];
                    if(argument !== undefined && argument !== "") {
                        args.push(argument);
                    }
                }

                return delegate.apply(this, args);
            }
        }

        var get = call.bind(null, 'get'),
            put = call.bind(null, 'put'),
            post = call.bind(null, 'post');

        return {
            channel: function(channelId) {
                var callChannel = get.bind(this, "channel", channelId);
                return {
                    list: noempty(callChannel("list")),
                    detail: noempty(callChannel("detail")),
                    playstate: function(itemId, playstate) {
                        if(playstate) {
                            return $http.put(apiurl("channel", channelId, "playstate", itemId), playstate);
                        }
                    }
                }
            },

            channels: get("channels"),

            players: get("players"),


        };

}]);