angular
    .module("pith.tvDetailsModule", ["pith.restApi"])
    .controller("TvDetailsController", ["$scope", "$pithRest", function($scope, $pithRest) {

        var channel = $pithRest.channel($scope.channelId);
        var self = this;

        $scope.selectedSeason = null;

        function fetchDetails(show) {
            if(show) {
                channel.detail(show.id).then(function(response) {
                    var show = response.data;
                    $scope.show = show;
                    $scope.seasons = show.seasons.sort(function(a,b) {
                        return a.season - b.season;
                    });
                    if(!$scope.selectedSeason || $scope.seasons.indexOf($scope.selectedSeason) == -1) {
                        $scope.selectedSeason = $scope.seasons[$scope.seasons.length - 1];
                    }
                });
            }
        }

        function fetchEpisodes(season) {
            if(season) {
                $scope.episodes = $scope.show.episodes.filter(function(ep) {
                    return ep.season == season.season;
                }).sort(function(a,b) {
                    return a.episode - b.episode;
                });
                $scope.glued = true;
            }
        }

        $scope.selectSeason = function(season) {
            $scope.selectedSeason = season;
            $scope.episodes = null;
        }

        $scope.$watch('$expandedItem', fetchDetails);
        $scope.$watch('selectedSeason', fetchEpisodes);

}]);
