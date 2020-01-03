const testCase = require("nodeunit").testCase;
const filenameparser = require('../lib/filenameparser.js');

const movietests = {
    "/media/2010.1984.720p.bluray.x264-sinners.mkv":
        {title: "2010", year: 1984},
    "/media/2010 (1984)/movie.mkv":
        {title: "2010", year: 1984},
    "/media/La.grande.bellezza.2013.1080p.BluRay.DTS.x264-HDMaNiAcS/4UMgue.mkv":
        {title: "La grande bellezza", year: 2013},
    "/media/death.race.2000.1975.x264-somegroup.mkv":
        {title: "death race 2000", year: 1975},
    "/media/12 Angry Men (1957)/12.Angry.Men.1957.720p.x264-bla.mkv":
        {title: "12 Angry Men", year: 1957}
};

const tvtests = {
    "/media/Series/Mad Men/Season 3/Mad Men - 3x07 - Seven Twenty Three.mkv":
        {title: "Seven Twenty Three", season: 3, episode: 7, showname: "Mad Men"},
    "Family Guy - 13x06 - The 2000-Year-Old Virgin.mkv":
        {title: "The 2000 Year Old Virgin", season: 13, episode: 6, showname: "Family Guy"}
};

let cases = {};
for(let x in tvtests) {
    cases[x] = (function(x) { return function(test) {
        const r = filenameparser(x, 'show');
        test.equal(r.title, tvtests[x].title);
        test.equal(r.season, tvtests[x].season);
        test.equal(r.episode, tvtests[x].episode);
        test.done();
    }})(x);
}
cases = {};
for(let x in movietests) {
    cases[x] = (function(x) { return function(test) {
        const r = filenameparser(x, 'movie');
        test.equal(r.title, movietests[x].title);
        test.equal(r.year, movietests[x].year);
        test.done();
    }})(x);
}
module.exports = testCase(cases);
