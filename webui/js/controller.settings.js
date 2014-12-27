"use strict";

var settingsModule = angular.module("SettingsControllers", ['SettingsServiceModule']);

settingsModule.controller('mainSettingsController',
    ['$scope','$http','$routeParams', '$rootScope', 'SettingsService',
        function($scope, $http, $routeParams, $rootScope, settings) {
            $scope.pages = [
                {
                    title: "Media",
                    template: "templates/settings/media.html",
                    active: true
                },
                {
                    title: "Players",
                    template: "templates/settings/players.html"
                }
            ];

            function load() {
                $scope.settings = angular.copy(settings.get());
            }

            if(settings.ready()) {
                load();
            } else {
                settings.once('load', load);
            }

            $scope.save = function() {
                settings.put($scope.settings);
            };
        }
    ]
);