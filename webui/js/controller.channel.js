"use strict";

var channelController = angular.module("ChannelControllers", []);

channelController.controller('channelController', 
        ['$scope','$http','$routeParams', '$rootScope',
        function($scope, $http, $routeParams, $rootScope) {
    
    $scope.containerContents = [];
    $scope.itemDetails = {};
    $scope.loading = true;
    $scope.channelId = $routeParams.channelId;
    $scope.currentContainer = $routeParams.containerId;
    $scope.currentPath = [];
    
    $scope.loading = true;
    
    function loadState(state) {
        $scope.currentContainer = state && state.channelpath[state.channelpath.length - 1].id || "";
        $scope.currentPath = state && state.channelpath || [];
        $scope.search = state.search;
        
        $scope.itemDetails = null;
        $scope.containerContents = null;
        
        $http.get("/rest/channel/detail/"+$scope.channelId+"/" + ($scope.currentContainer))
        .then(function(res) {
            var item = res.data;
            $scope.itemDetails = item;
            if(!item.type || item.type == 'container') {
                return $http.get("/rest/channel/list/"+$scope.channelId+"/" + ($scope.currentContainer||"")).then(function(res) {
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
        history.replaceState(history.state);
        history.pushState(state);
        loadState(state);
    }
    
    function replaceState(state) {
        history.replaceState(state);
        loadState(state);
    }
    
    $scope.load = function(itemId) {
        $rootScope.$broadcast('player:load', $scope.channelId, itemId);
    };
    
    $scope.open = function(item) {
        var currentState = history.state;
        var path = [item];
        if(currentState && currentState.channelpath) {
            path = currentState.channelpath.concat(path);
        }
        var newState = {
            channelpath: path,
            id: item.id
        };
        
        pushState(newState);
    };
    
    $scope.view = function view(v) {
        if(v) {
            localStorage.view = v;
        }
        return localStorage.view || "list";
    };

    $scope.goBack = function goBack(item) {
        var path = history.state.channelpath, x;
        for(x=0; x<path.length; x++) {
            if(path[x].id == item.id) {
                break;
            }
        }
        
        var newpath = path.slice(0, x+1);
        var newState = {
            channelpath: newpath,
            id: item.id
        };
        pushState(newState);
    };
    
    replaceState({channelpath: [{title: "Contents", id: ""}]});
    
    window.addEventListener("popstate", function(event) {
        loadState(event.state);
    });
}]);
