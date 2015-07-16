"use strict";

var channelController = angular.module("ChannelControllers", ['pith.restApi']);

channelController.controller('channelController',
    ['$scope', '$pithRest', '$routeParams', '$rootScope',
        function ($scope, $pithRest, $routeParams, $rootScope) {

            $scope.containerContents = [];
            $scope.itemDetails = {};
            $scope.loading = true;
            $scope.channelId = $routeParams.channelId;
            $scope.currentContainer = $routeParams.containerId;
            $scope.currentPath = [];
            $scope.expanded = null;

            $scope.loading = true;

            function loadState(state) {
                $scope.currentContainer = state && state.channelpath[state.channelpath.length - 1].id;
                $scope.currentPath = state && state.channelpath || [];
                $scope.search = state && state.search;

                $scope.itemDetails = null;
                $scope.containerContents = null;

                var channel = $pithRest.channel($scope.channelId);

                channel.detail($scope.currentContainer).then(function (res) {
                    var item = res.data;
                    $scope.itemDetails = item;
                    if (!item.type || item.type == 'container') {
                        return channel.list($scope.currentContainer, {includePlayStates: true}).then(function (res) {
                            $scope.loading = false;
                            $scope.containerContents = res.data;
                        });
                    } else {
                        $scope.loading = false;
                    }
                });
            }

            function pushState(state) {
                history.state.search = $scope.search;
                history.replaceState(history.state, history.state.title);
                history.pushState(state, state.title);
                loadState(state);
            }

            function replaceState(state) {
                history.replaceState(state, state.title);
                loadState(state);
            }

            $scope.load = function (item) {
                $rootScope.$broadcast('player:load', $scope.channelId, item.id);
            };

            $scope.toggleWatched = function (item) {
                if (item.playState && item.playState.status == 'watched') {
                    item.playState = {status: 'none'};
                } else {
                    item.playState = {status: 'watched'};
                }
                return $pithRest.channel($scope.channelId).playstate(item.id, item.playState);
            };

            $scope.open = function (item) {
                switch(item.type) {
                    case 'container':
                        var currentState = history.state;
                        var path = [item];
                        if (currentState && currentState.channelpath) {
                            path = currentState.channelpath.concat(path);
                        }
                        var newState = {
                            channelpath: path,
                            id: item.id
                        };

                        pushState(newState);
                        break;
                    default:
                        if($scope.expanded == item) {
                            $scope.expanded = null;
                        } else {
                            $scope.expanded = item;
                        }
                        break;
                }
            };

            $scope.view = function view(v) {
                if (v) {
                    localStorage.view = v;
                }
                return localStorage.view || "list";
            };

            $scope.goBack = function goBack(item) {
                var path = history.state.channelpath, x;
                for (x = 0; x < path.length; x++) {
                    if (path[x].id == item.id) {
                        break;
                    }
                }

                var newpath = path.slice(0, x + 1);
                var newState = {
                    channelpath: newpath,
                    id: item.id
                };
                pushState(newState, newState.title);
            };

            $scope.expand = function expand(item) {
                $scope.expanded = item;
            };

            replaceState({channelpath: [{title: "Contents", id: ""}]});

            window.addEventListener("popstate", function (event) {
                loadState(event.state);
            });
        }]);
