const fs = require("fs");
const mimetypes = require("../../lib/mimetypes");
const vidstreamer = require("../../lib/vidstreamer");
const async = require("async");
const $path = require("path");
const settings = require("../../lib/global")().settings;
const playstate = require("./playstate");
const ff = require("fluent-ffmpeg");
const Channel = require("../../lib/channel");
const wrapToPromise = require("../../lib/async").wrap;
const profiles = require("../../lib/profiles");
const keyframes = require("../../lib/keyframes");
const preview = require("./preview");

const metaDataProviders = [
    require("./movie-nfo"),
//    require("./tvshow-nfo"),
    require("./thumbnails"),
    require("./fanart")
];

class FilesChannel extends Channel {
    constructor(pith, statestore) {
        super();

        this.rootDir = settings.files.rootDir;
        this.pith = pith;

        const channel = this;

        this.statestore = statestore;

        vidstreamer.settings({
            getFile: function(path, cb) {
                cb(channel.getFile(path));
            }
        });

        pith.handle.use('/stream/:fingerprint', vidstreamer);
        pith.handle.use('/preview', preview(path => this.getFile(path)));
    }

    listContents(containerId) {
        return wrapToPromise(cb => {
            const rootDir = this.rootDir;
            let path;
            if(containerId) {
                path = $path.resolve(rootDir, containerId);
            } else {
                path = rootDir;
            }

            const filesChannel = this;

            fs.readdir(path, function(err, files) {
                if(err) {
                    cb(err);
                } else {
                    async.map(files.filter(function(e) {
                        return (e[0] != "." || settings.files.showHiddenFiles) && settings.files.excludeExtensions.indexOf($path.extname(e)) == -1;
                    }), function(file, cb) {
                        const filepath = $path.resolve(path, file);
                        const itemId = $path.relative(rootDir, filepath);
                        filesChannel.getItem(itemId, false).then(function(item) {
                            cb(false, item);
                        }).catch(cb);
                    }, function(err, contents) {
                        cb(err, contents.filter(function(e) { return e !== undefined; }));
                    });
                }
            });
        });
    }

    getFile(path) {
        return $path.resolve(this.rootDir, path);
    }

    getItem(itemId, detailed) {
        return new Promise((resolve, reject) => {
            if(detailed === undefined) {
                detailed = true;
            }

            const filepath = $path.resolve(this.rootDir, itemId);
            const channel = this;
            fs.stat(filepath, function(err, stats) {
                const item = {
                    title: $path.basename(itemId),
                    id: itemId
                };

                if(stats && stats.isDirectory()) {
                    item.type = 'container';
                    item.preferredView = "still";
                } else {
                    item.type = 'file';
                    const extension = $path.extname(itemId);
                    item.mimetype = mimetypes[extension];
                    item.playable = item.mimetype && true;

                    item.fileSize = stats && stats.size;
                    item.modificationTime = stats && stats.mtime;
                    item.creationTime = stats && stats.ctime;
                    item.fsPath = filepath;
                }

                const applicableProviders = metaDataProviders.filter(function (f) {
                    return f.appliesTo(channel, filepath, item);
                });

                if(applicableProviders.length) {
                    async.parallel(applicableProviders.map(function(f) {
                        return function(cb) {
                            f.get(channel, filepath, item, cb);
                        };
                    }), function() {
                        resolve(item);
                    });
                } else {
                    resolve(item);
                }
            });
        });
    }

    getStream(item, options) {
        return new Promise((resolve, reject) => {
            const channel = this;
            const itemId = item.id;
            const itemPath = itemId.split($path.sep).map(encodeURIComponent).join("/");
            ff.ffprobe(this.getFile(item.id), (err, metadata) => {
                if(err) {
                    reject(err);
                } else {
                    let duration = parseFloat(metadata.format.duration) * 1000;

                    const baseUrl = `${channel.pith.rootUrl}stream/${encodeURIComponent(options && options.fingerprint) || '0'}/${itemPath}`;

                    const desc = {
                        url: baseUrl,
                        mimetype: item.mimetype || 'application/octet-stream',
                        seekable: true,
                        format: {
                            container: metadata.format.tags ? metadata.format.tags.major_brand : 'unknown',
                            streams: metadata.streams.map(stream => ({
                                index: stream.index,
                                codec: stream.codec_name,
                                profile: stream.profile,
                                pixelFormat: stream.pix_fmt
                            }))
                        },
                        duration: duration
                    };

                    if(options && options.target) {
                        desc.streams = options.target.split(",").map((profileName) => {
                            let profile = profiles[profileName];
                            let url = `${baseUrl}?transcode=${profileName}`;
                            if(profile.requiresPlaylist) {
                                url += `&playlist=${profile.requiresPlaylist}`;
                            }

                            return {
                                url: url,
                                mimetype: profile.mimetype,
                                seekable: profile.seekable,
                                duration: duration
                            };
                        });
                    }

                    if(options && options.includeKeyFrames) {
                        keyframes(this.getFile(item.id), metadata).then(frames => {
                            desc.keyframes = frames;
                            resolve(desc);
                        }).catch(() => {
                            resolve(desc);
                        });
                    } else {
                        resolve(desc);
                    }
                }
            });
        });
    }

    getLastPlayState(itemId) {
        const state = this.statestore.get(itemId);
        return Promise.resolve(state);
    }

    getLastPlayStateFromItem(item) {
        return this.getLastPlayState(item.id);
    }

    putPlayState(itemId, state) {
        try {
            state.id = itemId;
            this.statestore.put(state);
            return Promise.resolve();
        } catch(e) {
            return Promise.reject(e);
        }
    }

    resolveFile(file) {
        if(file.startsWith(this.rootDir)) {
            let relative = file.substring(this.rootDir.length);
            if(relative.startsWith('/')) {
                relative = relative.substring(1);
            }
            return this.getItem(relative);
        } else {
            return Promise.reject("File not contained within media root");
        }
    }
}

module.exports = {
    init: function(opts) {
        playstate(opts.pith.db, function(err, statestore) {
            opts.pith.registerChannel({
                id: 'files',
                title: 'Files',
                type: 'channel',
                init: function(opts) {
                    return new FilesChannel(opts.pith, statestore);
                },
                sequence: 0
            });
        });
    },

    metaDataProviders: metaDataProviders
};
