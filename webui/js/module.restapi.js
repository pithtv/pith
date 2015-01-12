angular
    .module("pith.restApi", [])
    .factory("$pithRest", ["$http", function($http) {
        var apiRoot = '/rest';

        function slice(args, start, end) {
            return Array.prototype.slice.apply(args, Array.prototype.slice.apply(arguments, [1]));
        }

        function Module() {
            var args = Array.prototype.slice.apply(arguments, [0,-1]);
            var skel = Array.prototype.slice.apply(arguments, [-1])[0];

            function constructor(path) {
                this.root = path;
            }

            constructor.prototype = skel;

            return function() {
                var path = args.concat(slice(arguments));
                return new constructor(this.root ? this.root.concat(path) : path);
            }
        }

        function get() {
            var relpath = slice(arguments);
            return function() {
                var args,query;
                if(typeof arguments[arguments.length-1] === 'object') {
                    args = slice(arguments, 0, -1);
                    query = slice(arguments, -1)[0];
                } else {
                    args = slice(arguments);
                    query = null;
                }
                var path = this.root.concat(relpath).concat(args);
                return $http.get(path.join("/") + "/", {params: query});
            }
        }

        function putOrGet() {
            var relpath = slice(arguments);
            return function() {
                var args,obj;
                if(typeof arguments[arguments.length-1] === 'object') {
                    args = slice(arguments, 0, -1);
                    obj = slice(arguments, -1)[0];
                } else {
                    args = slice(arguments);
                    obj = null;
                }
                var path = this.root.concat(relpath).concat(args);
                if(obj) {
                    return $http.put(path.join("/"), obj);
                } else {
                    return $http.get(path.join("/"));
                }
            }
        }

        function noempty(delegate) {
            return function() {
                var args = [];
                for(var x=0,l=arguments.length;x<l;x++) {
                    var arg = arguments[x];
                    if(arg !== undefined && arg !== '') {
                        args.push(arg);
                    }
                }
                return delegate.apply(this, args);
            }
        }

        return Module("/rest", {
            channels: get("channels"),

            channel: Module("channel", {
                list: noempty(get("list")),
                detail: noempty(get("detail")),
                playstate: putOrGet("playstate")
            }),

            players: get("players"),

            player: Module("player", {
                pause: get("pause"),
                play: get("play"),
                stop: get("stop"),
                seek: get("seek"),
                load: get("load")
            })
        })();

}]);