"use strict";

var channelController = angular.module("ChannelControllers", []);

channelController.controller('channelController', 
        ['$scope','$http','$routeParams','PlayerControlService',
        function($scope, $http, $routeParams, playerControl) {
    
    $scope.containerContents = [];
    $scope.itemDetails = {};
    $scope.loading = true;
    $scope.channelId = $routeParams.channelId;
    $scope.currentContainer = $routeParams.containerId;
    
    $scope.loading = true;
    $http.get("/rest/channel/detail/"+$scope.channelId+"/" + ($scope.currentContainer||""))
        .then(function(res) {
            var item = res.data;
            $scope.itemDetails = item;
            if(item.type == 'container') {
                return $http.get("/rest/channel/list/"+$scope.channelId+"/" + ($scope.currentContainer||"")).then(function(res) {
                    $scope.loading = false;
                    $scope.containerContents = res.data;
                });
            } else {
                $scope.loading = false;
            }
        });
    
    $scope.load = function(itemId) {
        playerControl.load($scope.channelId, itemId);
    }
    
    $scope.view = function view(v) {
        if(v) {
            localStorage.view = v;
        }
        return localStorage.view || "list";
    };
}]);
