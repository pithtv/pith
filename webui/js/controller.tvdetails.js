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
                        return a.season == b.season ? 0 : a.season == 0 ? 1 : b.season == 0 ? -1 : a.season - b.season;
                    });
                    if(!$scope.selectedSeason || $scope.seasons.indexOf($scope.selectedSeason) == -1) {
                        $scope.selectedSeason = $scope.seasons[0];
                        for(var x=1,l=$scope.seasons.length;x<l;x++) {
                            var season = $scope.seasons[x];
                            if((season.playState && season.playState.status == 'inprogress') || ($scope.seasons[x-1].playState && $scope.seasons[x-1].playState.status == 'watched')) {
                                $scope.selectedSeason = season;
                            }
                        }
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
        };

        $scope.$watch('$expandedItem', fetchDetails);
        $scope.$watch('selectedSeason', fetchEpisodes);

}]);
