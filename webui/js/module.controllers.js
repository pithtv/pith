"use strict";

var app = angular.module("PithApp",
    ["PithFilters",
        "ngRoute",
        "ChannelControllers",
        "PlayerControlModule",
        "SettingsControllers",
        "vs-repeat",
        "gallery",
        "angular-loading-bar",
        "ui.bootstrap",
        "pith.restApi"])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }]);

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
            }).
            when('/settings', {
                templateUrl: 'templates/settings.html',
                controller: 'mainSettingsController'
            }).
            otherwise({
                redirectTo: ''
            })
    }]);

app.controller("MainController", ['$scope','$pithRest','PlayerControlService', "$modal", function($scope, $pithRest, playerControl, $modal) {
    var main = this;
    
    this.channels = [];
    
    $scope.$on('cfpLoadingBar:loading', function() {
        $scope.loading = true;
    });
    
    $scope.$on('cfpLoadingBar:completed', function() {
        $scope.loading = false;
    });

    $scope.prescale = function(url, size) {
        return '/scale/' + (url) + '?size=' + size;
    };
    
    $scope.$on('player:load', function(event, channelId, itemId) {
        playerControl.getLastPlayState(channelId, itemId)
         .success(function(state) {
             if(state.status == 'inprogress') {
                var scope = $scope.$new();
                scope.time = state.time;
                scope.duration = state.duration;
                
                scope.restart = function() {
                    playerControl.load(channelId, itemId);
                };
                
                scope.resume = function() {
                    playerControl.load(channelId, itemId, state.time);
                };
        
                $modal.open({
                    title: 'My Title',
                    templateUrl: 'templates/resumeplayprompt.html',
                    show: true,
                    scope: scope
                });
            } else {
                playerControl.load(channelId, itemId);
            }
        });
    });
    
    $pithRest.channels().then(function(res) {
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
    
    playerControl.on("playerlistchanged", function() {
        $scope.$apply();
    });
    
    this.handleSeekClick = function(event) {
        var targetTime = main.currentStatus.position.duration * event.offsetX / event.currentTarget.offsetWidth;
        playerControl.seek(targetTime);
    };
    
    this.control = playerControl;
 }]);

app.directive('convertMs', function() {
    return { restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            if(ngModel) { // Don't do anything unless we have a model

                ngModel.$parsers.push(function (value) {
                    return value * 1000 * 60;
                });

                ngModel.$formatters.push(function (value) {
                    return value / 1000 / 60;
                });

            }
        }
    };
});