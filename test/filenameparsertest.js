var testCase = require("nodeunit").testCase;
var filenameparser = require('../lib/filenameparser.js');

var tests = {
    "/media/2010.1984.720p.bluray.x264-sinners.mkv":
        { title: "2010", year: 1984 },
    "/media/2010 (1984)/movie.mkv":
        { title: "2010", year: 1984 },
    "/media/La.grande.bellezza.2013.1080p.BluRay.DTS.x264-HDMaNiAcS/4UMgue.mkv":
        { title: "La grande belleza", year: 2013 },
    "/media/death.race.2000.1975.x264-somegroup.mkv":
        { title: "death race 2000", year: 1975 },
        
    "/media/Series/Mad Men/Season 3/Mad Men - 3x07 - Seven Twenty Three.mkv":
        {title: "Mad Men", season: 3, episode: 7}
};

var cases = {};
for(var x in tests) {
    cases[x] = function(test) {
        var r = filenameparser(x);
        test.equal(tests[x].title, r.title);
        test.equal(tests[x].year, r.year);
        test.equal(tests[x].season, r.season);
        test.equal(tests[x].episode, r.episode);
        test.done();
    };
};

module.exports = testCase(cases);