var mimeTypes = require("./mimetypes");

var profiles = {
    "hls": {
        // flags: "-f mp4 -vcodec copy -acodec copy -strict experimental -preset ultrafast -movflags frag_keyframe+empty_moov+faststart",
        mimetype: mimeTypes[".m3u8"],
        setup(ff) {
            return ff
                .format("mpegts")
                .videoCodec("libx264")
                .audioCodec("libmp3lame")
                // .preset("ultrafast")
                .outputOptions("-flags2 +fast -flags +loop -g 30 -keyint_min 1 -bf 0 -b_strategy 0 -refs 1 -coder 0 -me_range 16 -subq 5 -partitions +parti4x4+parti8x8+partp8x8 -trellis 0 -sc_threshold 40 -i_qfactor 0.71 -qcomp 0.6 -bufsize 512k -b 1700k -bt 1800k -qmax 48 -qmin 2 -r 23.0 -ab 192k -ar 48000 -ac 2".split(" "));
        },
        requiresPlaylist: "m3u8",
        seekable: true
    },
    "webmp4": {
        // flags: "-f mp4 -vcodec copy -acodec copy -strict experimental -preset ultrafast -movflags frag_keyframe+empty_moov+faststart",
        mimetype: "video/mp4",
        setup(ff) {
            return ff
                .format("mp4")
                .videoCodec("libx264")
                .audioCodec("aac")
                // .preset("ultrafast")
                .outputOptions("-preset:v ultrafast -profile:v baseline -movflags frag_keyframe+empty_moov+faststart".split(" "));
        },
        seekable: false
    }
};

module.exports = profiles;