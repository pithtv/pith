"use strict";

var settingsModule = angular.module("SettingsControllers", []);

settingsModule.controller('mainSettingsController',
    ['$scope','$http','$routeParams', '$rootScope',
        function($scope, $http, $routeParams, $rootScope) {
            $scope.pages = [
                {
                    title: "General",
                    template: "templates/settings/general.html",
                    active: true
                },
                {
                    title: "Players",
                    template: "templates/settings/players.html"
                }
            ];
        }
    ]
);