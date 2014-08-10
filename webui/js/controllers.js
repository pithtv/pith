"use strict";

var app = angular.module("PithApp", ["PithFilters", "ui.bootstrap", "ngRoute", "ChannelControllers", "PlayerControlModule"]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/channel/:channelId/:containerId*?', {
                templateUrl: 'templates/channel.html',
                controller: 'channelController'
            }).
            when('', {
                templateUrl: 'templates/main.html',
                controller: 'mainController'
            }).otherwise({
                redirectTo: ''
            });
    }]);

app.controller("MainController", ['$scope','$http','PlayerControlService', function($scope, $http, playerControl) {
    var main = this;
    
    this.channels = [];
    
    $http.get('/rest/channels')
        .then(function(res) {
            $scope.main.channels = res.data;
        });
    
    this.getPlayers = function() {
        return playerControl.getAvailablePlayers();
    };
    
    this.getSelectedPlayer = function() {
        return playerControl.getSelectedPlayer();
    };
    
    this.selectPlayer = function(playerId) {
        playerControl.selectPlayer(playerId);
    };
    
    playerControl.on("playerstatechange", function(status) {
        main.currentStatus = status;
        $scope.$apply();
    });
    
    this.control = playerControl;
 }]);
