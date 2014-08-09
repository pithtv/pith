"use strict";

var channelController = angular.module("ChannelControllers", []);

channelController.controller('channelController', ['$scope','$http','$routeParams', function($scope, $http, $routeParams) {
    $scope.containerContents = [];
    $scope.loading = true;
    $scope.channelId = $routeParams.channelId;
    $scope.currentContainer = $routeParams.containerId;
    
    $scope.loading = true;
    $http.get("/rest/channel/"+$scope.channelId+"/" + ($scope.currentContainer||""))
        .then(function(res) {
            $scope.loading = false;
            $scope.containerContents = res.data;
        });
    
    $scope.play = function(itemId) {
        $http.get("/rest/player/0/load/" + $scope.channelId + "/" + itemId);
    }
}]);
