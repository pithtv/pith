const {MediaServer} = require("./MediaServer");
const {wrap, wrapNoErr} = require('../../lib/async');
const Global = require("../../lib/global")();
const upnp = require('../../lib/upnp');

function upnpClassFromItem(item) {
    if (item.type === 'container') {
        switch (item.mediatype) {
            case 'show':
            case 'season':
                return 'object.container.album.videoAlbum';
            default:
                return 'object.container';
        }
    } else if (item.type === 'file') {
        switch (item.mimetype && item.mimetype.split('/')[0]) {
            case 'video':
                switch (item.mediatype) {
                    case 'movie':
                        return 'object.item.videoItem.movie';
                    case 'episode':
                        return 'object.item.videoItem.videoBroadcast';
                    default:
                        return 'object.item.videoItem';
                }
            case 'image':
                return 'object.item.imageItem';
            case 'audio':
                return 'object.item.musicItem';
            default:
                return 'object.item';
        }
    }
}

class MediaServerDelegate {
    constructor(pith) {
        this.pith = pith;
    }

    async fetchChildren(id, opts) {
        if (id == 0) {
            let channels = await wrapNoErr(cb => this.pith.listChannels(cb));
            let items = channels.map(channel => ({
                id: `channel:${channel.id}`,
                parentId: 0,
                updateId: 0,
                type: 'container',
                properties: {
                    "dc:title": channel.title,
                    "upnp:class": "object.container"
                }
            }));
            return {
                updateId: 0,
                items: items,
                totalItems: items.length
            };
        } else {
            let [, channelId, , itemId] = id.match(/^channel:(\w+)(:(.*))?$/);
            let channel = this.pith.getChannelInstance(channelId);
            let contents = await channel.listContents(itemId);
            let items = contents.map(item => this.mapObject(channel, item, id, channelId));
            return {
                updateId: 0,
                items: items,
                totalItems: items.length
            };
        }
    }

    mapObject(channel, item, id, channelId) {
        return ({
            id: `channel:${channel.id}:${item.id}`,
            parentId: item.parentId ? `channel:${channel.id}:${item.parentId}` : id,
            updateId: 0,
            type: item.type === 'container' ? 'container' : 'item',
            properties: {
                "dc:title": item.title,
                "upnp:class": upnpClassFromItem(item),
                "dc:date": upnp.formatDate(item.airDate) || upnp.formatDate(item.releaseDate) || (item.year && `${item.year}-01-01`) || undefined,
                "upnp:genre": item.genres,
                "upnp:author": item.writers,
                "upnp:director": item.director,
                "upnp:longDescription": item.plot,
                "xbmc:dateadded": item.creationTime,
                "xbmc:rating": item.tmdbRating,
                "xbmc:votes": item.tmdbVoteCount,
                "xbmc:uniqueIdentifier": item.imdbId,
                "xbmc:artwork": [
                    item.fanart ? {_attribs: { type: "fanart"}, _value: item.fanart} : undefined,
                    item.poster ? {_attribs: { type: "poster"}, _value: item.poster} : undefined
                ]
            },
            resources: [
                {
                    uri: `${Global.rootUrl}/rest/channel/${channelId}/redirect/${encodeURIComponent(item.id)}`,
                    protocolInfo: `http-get:*:${item.mimetype}:DLNA.ORG_OP=01;DLNA.ORG_CI=0`
                },
                item.poster ? {
                    uri: item.poster,
                    protocolInfo: "xbmc.org:*:poster:*"
                } : undefined,
                item.fanart ? {
                    uri: item.fanart,
                    protocolInfo: "xbmc.org:*:fanart:*"
                } : undefined
            ]
        });
    }

    async fetchObject(id) {
        let [, channelId, , itemId] = id.match(/^channel:(\w+)(:(.*))?$/);
        if (itemId) {
            let channel = this.pith.getChannelInstance(channelId);
            let contents = await channel.getItem(itemId);
            let item = this.mapObject(channel, contents, id, channelId);
            return {
                updateId: 0,
                item: item
            };
        }
    }
}

module.exports = {
    init(opts) {
        let mediaserver = new MediaServer({
            name: 'MediaServer',
            address: Global.bindAddress,
            delegate: new MediaServerDelegate(opts.pith),
            uuid: Global.persistentUuid('MediaServer')
        });
        mediaserver.on('ready', () => {
            mediaserver.ssdpAnnounce();
        })
    }
};