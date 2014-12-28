angular
    .module("errorDialogModule", ["ui.bootstrap"])
    .factory("modalHttpError", ["$modal", "$rootScope", function($modal, $rootScope) {
        function modalHttpError(data, status, header, config) {
            var scope = $rootScope.$new();
            scope.message = data.message;
            $modal.open({
                templateUrl: "errordialog.html",
                show: true,
                scope: scope
            });
        }

        return modalHttpError;
    }]);