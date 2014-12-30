angular
    .module("pith.containerChooserModule", ["pith.restApi"])
    .controller("containerChooserController", ["$scope", "$pithRest", "$modalInstance", function($scope, $pithRest, $modalInstance) {

        var channelHistory = [],
            state = {
                channelId: null,
                containerId: null,
                title: null
            };

        function refresh() {
            if(state.channelId === null) {
                $pithRest.channels().then(function(res) {
                    $scope.contents = res.data;
                    $scope.go = function(id, title) {
                        channelHistory.push(state);
                        state = {
                            channelId: id,
                            containerId: null,
                            title: title
                        };
                        refresh();
                    }
                    $scope.goBack = null;
                });
            } else {
                var p;
                if(state.containerId === null) {
                    p = $pithRest.channel.list(state.channelId);
                } else {
                    p = $pithRest.channel.list(state.channelId, state.containerId);
                }
                p.then(function(res) {
                    $scope.contents = res.data;
                    $scope.go = function(id, title) {
                        channelHistory.push(state);
                        state = {
                            channelId: state.channelId,
                            containerId: id,
                            title: title
                        };
                        refresh();
                    }

                    $scope.goBack = function() {
                        if(channelHistory.length) {
                            state = channelHistory.pop();
                        }
                        refresh();
                    }
                });
            }

            $scope.limit = 100;
            $scope.channelId = state.channelId;
            $scope.containerId = state.containerId;
            $scope.title = state.title;
        }

        $scope.showMore = function() {
            $scope.limit *= 2;
        }

        $scope.select = function() {
            $modalInstance.close(state);
        }

        refresh();
    }]);