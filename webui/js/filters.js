angular.module('PithFilters', []).filter('duration', function() {
    return function(input) {
        if(input === undefined) {
            return "-:--";
        } else {
            return sprintf("%d:%02d", input/60, input%60);
        }
    };
});