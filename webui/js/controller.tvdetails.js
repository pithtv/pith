angular
    .module("pith.tvDetailsModule", ["pith.restApi"])
    .controller("TvDetailsController", ["$scope", "$pithRest", function($scope, $pithRest) {

        var channel = $pithRest.channel($scope.channelId);
        var self = this;

        $scope.selectedSeason = null;

        function fetchSeasons(show) {
            if(show) {
                channel.list(show.id).then(function(seasons) {
                    $scope.seasons = seasons.data;
                    if(!$scope.selectedSeason || $scope.seasons.indexOf($scope.selectedSeason) == -1) {
                        $scope.selectedSeason = $scope.seasons[$scope.seasons.length - 1];
                    }
                });
            }
        }

        function fetchEpisodes(season) {
            if(season) {
                channel.list(season.id, {includePlayStates: true}).then(function(episodes) {
                    $scope.episodes = episodes.data;
                })
            }
        }

        $scope.selectSeason = function(season) {
            $scope.selectedSeason = season;
            $scope.episodes = null;
        }

        $scope.$watch('$expandedItem', fetchSeasons);
        $scope.$watch('selectedSeason', fetchEpisodes);

}]);
