"use strict";

angular
    .module("SettingsServiceModule", [])
    .factory("SettingsService", ["$http", function($http) {
        var settings = undefined;

        function loadSettings() {
            $http
                .get('/rest/settings')
                .then(function(res) {
                    settings = res.data;
                    service.emit('load');
                });
        }

        var service = {
            ready: function() { return settings !== undefined; },
            get: function() { return settings; },
            put: function(s) {
                settings = s;
                $http.put('/rest/settings', s);
            },
            load: loadSettings
        };

        for(var x in EventEmitter.prototype) {
            service[x] = EventEmitter.prototype[x];
        }

        loadSettings();

        return service;
    }]);