import {expect, test} from '@jest/globals';
import filenameparser from '../src/lib/filenameparser';

test("Numeric title and year in filename", () => {
    const r = filenameparser("/media/2010.1984.720p.bluray.x264-sinners.mkv", 'movie');
    expect(r).toEqual({title: "2010", year: 1984, mediatype: 'movie'});
});
test("Numeric title and year in parent directory between brackets", () => {
    const r = filenameparser("/media/2010 (1984)/movie.mkv", 'movie');
    expect(r).toEqual({title: "2010", year: 1984, mediatype: 'movie'});
});
test("Title and year scrambled in directory", () => {
    const r = filenameparser("/media/La.grande.bellezza.2013.1080p.BluRay.DTS.x264-HDMaNiAcS/4UMgue.mkv", 'movie');
    expect(r).toEqual({title: "La grande bellezza", year: 2013, mediatype: 'movie'});
});
test("Title with a year in it, and year in filename", () => {
    const r = filenameparser("/media/death.race.2000.1975.x264-somegroup.mkv", 'movie');
    expect(r).toEqual({title: "death race 2000", year: 1975, mediatype: 'movie'});
});
test("Title and year in both directory and filename", () => {
    const r = filenameparser("/media/12 Angry Men (1957)/12.Angry.Men.1957.720p.x264-bla.mkv", 'movie');
    expect(r).toEqual({title: "12 Angry Men", year: 1957, mediatype: 'movie'});
});
test("Title and year only in directory with another subdirectory", () => {
    const r = filenameparser("Movies HD/Angels in America (2003)/VIDEO_TS/VTS_03_1.VOB", "movie");
    expect(r).toEqual({title: "Angels in America", year: 2003, mediatype: 'movie'});
});
test("Title and year only in directory", () => {
    const r = filenameparser("Movies HD/Angels in America (2003)/VIDEO_TS", "movie");
    expect(r).toEqual({title: "Angels in America", year: 2003, mediatype: 'movie'});
});

test("Showname/season/showname - seasonxepisode - title", () => {
    const r = filenameparser("/media/Series/Mad Men/Season 3/Mad Men - 3x07 - Seven Twenty Three.mkv", "show");
    expect(r).toEqual({title: "Seven Twenty Three", season: 3, episode: 7, showname: "Mad Men", mediatype: 'episode'});
});
test("showname - seasonxepisode - title", () => {
    const r = filenameparser("Family Guy - 13x06 - The 2000-Year-Old Virgin.mkv", "show");
    expect(r).toEqual({title: "The 2000 Year Old Virgin", season: 13, episode: 6, showname: "Family Guy", mediatype: 'episode'});
});
test("Showname and episode name have a year in it", () => {
    const r = filenameparser("/media/TV Shows/Archer (2009)/Season 10/Archer (2009) - 10x03 - 1999- The Leftovers.mkv", "show");
    expect(r).toEqual({title: "1999 The Leftovers", season: 10, episode: 3, showname: "Archer", mediatype: 'episode'});
});
