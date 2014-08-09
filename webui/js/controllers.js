"use strict";

var app = angular.module("PithApp", ["PithFilters", "ui.bootstrap", "ngRoute", "ChannelControllers"]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/channel/:channelId/:containerId*?', {
                templateUrl: 'templates/channel.html',
                controller: 'channelController'
            });
    }]);

app.controller("MainController", function($scope, $http) {
    this.channels = [];
    this.players = [];
    
    $http.get('/rest/channels')
        .then(function(res) {
            $scope.main.channels = res.data;
        });
    
    $http.get('/rest/players')
        .then(function(res) {
            $scope.main.players = res.data;
        });
 });