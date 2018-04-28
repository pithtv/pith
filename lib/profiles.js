/**
 * Defines transcoding profiles.
 */

var mimeTypes = require("./mimetypes");

function video(metadata) {
    return metadata.streams.find(stream => stream.width);
}

function audio(metadata) {
    return metadata.streams.find(stream => !stream.width);
}

var profiles = {
    "hls": {
        // flags: "-f mp4 -vcodec copy -acodec copy -strict experimental -preset ultrafast -movflags frag_keyframe+empty_moov+faststart",
        mimetype: mimeTypes[".m3u8"],
        setup(ff, metadata) {
            return ff
                .format("mpegts")
                .videoCodec("libx264")
                .audioCodec("libmp3lame")
        },
        requiresPlaylist: "m3u8",
        seekable: true
    },
    "webmp4": {
        // flags: "-f mp4 -vcodec copy -acodec copy -strict experimental -preset ultrafast -movflags frag_keyframe+empty_moov+faststart",
        mimetype: "video/mp4",
        setup(ff, metadata) {
            let videoCopy = (video(metadata).codec_name == 'h264');
            let audioCopy = false; //(audio(metadata).codec_name == 'aac')

            return ff
                .inputOptions(["-noaccurate_seek"])
                .format("mp4")
                .videoCodec(videoCopy ? "copy" : "libx264")
                .audioCodec(audioCopy ? "copy" : "aac")
                // .preset("ultrafast")
                .outputOptions(((videoCopy ? "-avoid_negative_ts make_zero" : "-preset:v ultrafast -profile:v baseline") + " -movflags frag_keyframe+empty_moov+faststart").split(" "));
        },
        seekable: false
    }
};

module.exports = profiles;