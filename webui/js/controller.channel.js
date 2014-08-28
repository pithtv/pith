"use strict";

var channelController = angular.module("ChannelControllers", []);

channelController.controller('channelController', ['$scope','$http','$routeParams','PlayerControlService', function($scope, $http, $routeParams, playerControl) {
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
