const testCase = require("nodeunit").testCase;
const filenameparser = require('../lib/filenameparser.js');

const movietests = {
    "/media/2010.1984.720p.bluray.x264-sinners.mkv":
        {title: "2010", year: 1984, mediatype: 'movie'},
    "/media/2010 (1984)/movie.mkv":
        {title: "2010", year: 1984, mediatype: 'movie'},
    "/media/La.grande.bellezza.2013.1080p.BluRay.DTS.x264-HDMaNiAcS/4UMgue.mkv":
        {title: "La grande bellezza", year: 2013, mediatype: 'movie'},
    "/media/death.race.2000.1975.x264-somegroup.mkv":
        {title: "death race 2000", year: 1975, mediatype: 'movie'},
    "/media/12 Angry Men (1957)/12.Angry.Men.1957.720p.x264-bla.mkv":
        {title: "12 Angry Men", year: 1957, mediatype: 'movie'}
};

const tvtests = {
    "/media/Series/Mad Men/Season 3/Mad Men - 3x07 - Seven Twenty Three.mkv":
        {title: "Seven Twenty Three", season: 3, episode: 7, showname: "Mad Men", mediatype: 'episode'},
    "Family Guy - 13x06 - The 2000-Year-Old Virgin.mkv":
        {title: "The 2000 Year Old Virgin", season: 13, episode: 6, showname: "Family Guy", mediatype: 'episode'},
    "/media/TV Shows/Archer (2009)/Season 10/Archer (2009) - 10x03 - 1999- The Leftovers.mkv":
        {title: "1999 The Leftovers", season: 10, episode: 3, showname: "Archer", mediatype: 'episode'}
};

let cases = {};
for(let x in tvtests) {
    cases[x] = (function(x) { return function(test) {
        const r = filenameparser(x, 'show');
        test.deepEqual(r, tvtests[x]);
        test.done();
    }})(x);
}
for(let x in movietests) {
    cases[x] = (function(x) { return function(test) {
        const r = filenameparser(x, 'movie');
        test.deepEqual(r, movietests[x]);
        test.done();
    }})(x);
}
module.exports = testCase(cases);
