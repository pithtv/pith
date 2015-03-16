"use strict";

var settingsModule = angular.module("SettingsControllers", ['SettingsServiceModule', 'ui.bootstrap', 'pith.containerChooserModule']);

settingsModule.controller('mainSettingsController',
    ['$scope', '$http', '$routeParams', '$rootScope', 'SettingsService',
        function ($scope, $http, $routeParams, $rootScope, $settingsService) {
            var settings;

            $scope.pages = [
                {
                    title: "Media",
                    template: "templates/settings/media.html",
                    active: true
                },
                //{
                //    title: "Players",
                //    template: "templates/settings/players.html"
                //},
                {
                    title: "Advanced",
                    template: "templates/settings/advanced.html"
                }
            ];

            function load() {
                $scope.settings = settings = angular.copy($settingsService.get());
            }

            if ($settingsService.ready()) {
                load();
            } else {
                $settingsService.once('load', load);
            }

            $scope.save = function () {
                $settingsService.put($scope.settings);
            };
        }
    ]
).controller('mediaSettingsController', ["$scope", "$modal", function ($scope, $modal) {
        var settings = $scope.$parent.settings;

        $scope.addLibraryContainer = function(type) {
            $modal.open({
                templateUrl: 'templates/settings/containerchooser.html',
                controller: 'containerChooserController',
                title: "Choose a container"
            }).result.then(function (s) {
                    settings.library.folders.push(s);
                    s.contains = type;
                    $scope.openFolder = s;
                });
        };

        $scope.removeLibraryContainer = function (container) {
            $modal.open({
                templateUrl: 'templates/settings/confirmremovelibrarycontainer.html',
            }).result.then(function () {
                    settings.library.folders.splice(settings.library.folders.indexOf(container), 1);
                })
        }

        $scope.categories = {
            movies: "Movies",
            tvshows: "TV shows",
            music: "Music"
        };
    }]);