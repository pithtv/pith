var movieMatch = /(.+)\W([0-9]{4})[^-][0-9]\W/;
var tvShowMatch = /(.+)[\W_]+[sS]?([0-9]{1,3})[.eE-x]([0-9]{2,3})( - (.*))?\W/;
var nonCharacter = /[\W_]+/g;
var trailingNonCharacter = /[\W_]+$/;
var leadingNonCharacter = /[\W_]+$/;

var normalize = function(f) {
    return f && f.replace(nonCharacter, ' ').replace(trailingNonCharacter, '').replace(leadingNonCharacter, '');
};

module.exports = function(fn, kind) {
    "use strict";

    var parts = fn.split(/\/+/g), part, f, title, year, season, episode, showname;
    while(parts.length > 0) {
        part = parts.pop();
        if(kind === undefined || kind == 'movie') {
            f = part.match(movieMatch);
            if (f) {
                title = normalize(f[1]);
                year = parseInt(f[2]);

                if (title && year) {
                    return {
                        title: title,
                        year: year,
                        mediatype: 'movie'
                    };
                }
            }
        }

        if(kind === undefined || kind === 'show') {
            f = part.match(tvShowMatch);
            if (f) {
                title = normalize(f[5]);
                season = parseInt(f[2]);
                episode = parseInt(f[3]);
                showname = normalize(f[1]);

                if (title && season && episode) {
                    return {
                        title: title,
                        showname: showname,
                        season: season,
                        episode: episode,
                        mediatype: 'episode'
                    };
                }
            }
        }
    }
};