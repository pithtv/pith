angular.module('PithFilters', []).filter('duration', function() {
    return function(input) {
       return sprintf("%d:%02d", input/60, input%60);
    };
});