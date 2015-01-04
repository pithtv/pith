angular
    .module("pith.restApi", [])
    .factory("$pithRest", ["$http", function($http) {

        function call(baseUri) {
            var path = Array.prototype.slice.apply(arguments);
            return function() {
                var args = angular.copy(arguments, []),
                    url = ["/rest"].concat(path).concat(args).join("/") + "/";

                return $http.get(url);
            }
        }

        return {
            channel: function(channelId) {
                var callChannel = call.bind(null, "channel", channelId);
                return {
                    list: callChannel("list")
                }
            },

            channels: call("channels")
        };

}]);