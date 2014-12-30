angular
    .module("pith.restApi", [])
    .factory("$pithRest", ["$http", function($http) {

        function call(baseUri) {
            return function() {
                var args = angular.copy(arguments, []),
                    url = ["/rest", baseUri].concat(args).join("/") + "/";

                return $http.get(url);
            }
        }

        return {
            channel: {
                list: call("channel/list")
            },

            channels: call("channels")
        };

}]);