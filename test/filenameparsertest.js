var testCase = require("nodeunit").testCase;
var filenameparser = require('../lib/filenameparser.js');

var movietests = {
    "/media/2010.1984.720p.bluray.x264-sinners.mkv":
        { title: "2010", year: 1984 },
    "/media/2010 (1984)/movie.mkv":
        { title: "2010", year: 1984 },
    "/media/La.grande.bellezza.2013.1080p.BluRay.DTS.x264-HDMaNiAcS/4UMgue.mkv":
        { title: "La grande bellezza", year: 2013 },
    "/media/death.race.2000.1975.x264-somegroup.mkv":
        { title: "death race 2000", year: 1975 }};

var tvtests = {
    "/media/Series/Mad Men/Season 3/Mad Men - 3x07 - Seven Twenty Three.mkv":
        {title: "Seven Twenty Three", season: 3, episode: 7, showname: "Mad Men" },
    "Family Guy - 13x06 - The 2000-Year-Old Virgin.mkv":
        {title: "The 2000 Year Old Virgin", season: 13, episode: 6, showname: "Family Guy"}
};

var cases = {};
for(var x in tvtests) {
    cases[x] = (function(x) { return function(test) {
        var r = filenameparser(x, 'show');
        test.equal(r.title, tvtests[x].title);
        test.equal(r.season, tvtests[x].season);
        test.equal(r.episode, tvtests[x].episode);
        test.done();
    }})(x);
};


var cases = {};
for(var x in movietests) {
    cases[x] = (function(x) { return function(test) {
        var r = filenameparser(x, 'movie');
        test.equal(r.title, movietests[x].title);
        test.equal(r.year, movietests[x].year);
        test.done();
    }})(x);
};

module.exports = testCase(cases);