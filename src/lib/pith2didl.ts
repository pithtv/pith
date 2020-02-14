import * as upnp from './upnp';
import {Global} from './global';
import entities from 'entities';
import {getLogger} from 'log4js';
import {sprintf} from 'sprintf-js';
import {didl} from './didl';
import {XmlObject} from './util';
import {IChannel, IChannelItem} from '../channel';
import {container} from 'tsyringe';

const global = container.resolve(Global);
const logger = getLogger("pith.pith2didl");

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
                        if (item.unavailable) {
                            return 'object.item.epgItem.videoProgram';
                        } else {
                            return 'object.item.videoItem.videoBroadcast';
                        }
                    default:
                        return 'object.item.videoItem';
                }
            case 'image':
                return 'object.item.imageItem';
            case 'audio':
                return 'object.item.musicItem';
            default:
                logger.warn(`Unable to determine type for item ${item.title} - ${item.filePath}.`);
                return 'object.item';
        }
    } else {
        throw `Item type ${item.type} missing or not implemented`;
    }
}

function cacheAndResize(sourceUrl, width, height, format) {
    return `${global.rootUrl}/scale/${encodeURIComponent(sourceUrl)}?size=${width}x${height}&format=${format}`;
}

function cache(sourceUrl) {
    return `${global.rootUrl}/scale/${encodeURIComponent(sourceUrl)}?size=original`;
}

export function convertToDidl(channel, item, parentId, channelId): didl.Item {
    return ({
        id: `channel:${channel.id}:${item.id}`,
        parentId: item.parentId ? `channel:${channel.id}:${item.parentId}` : parentId,
        updateId: 0,
        type: item.type === 'container' ? 'container' : 'item',
        properties: toDidlProperties(item, channel),
        resources: [
            ...(item.playable ? [{
                uri: `${global.rootUrl}/rest/channel/${channelId}/redirect/${encodeURIComponent(item.id)}`,
                protocolInfo: `http-get:*:${item.mimetype}:DLNA.ORG_OP=01;DLNA.ORG_CI=0`
            }] : []),
            ...(item.poster ? [{
                uri: entities.encodeXML(cache(item.poster)),
                protocolInfo: 'xbmc.org:*:poster:*'
            }] : []),
            ...(item.backdrop ? [{
                uri: entities.encodeXML(cache(item.backdrop)),
                protocolInfo: 'xbmc.org:*:fanart:*'
            }] : [])
        ]
    });
}

function toDidlProperties(item : IChannelItem, channel : IChannel) : XmlObject {
    let coverArt = item.thumb || item.poster;

    let didl = {
        'dc:title': item.title,
        'upnp:class': upnpClassFromItem(item),
        'dc:date': upnp.formatDate(item.airDate) || upnp.formatDate(item.releaseDate) || (item.year && `${item.year}-01-01`) || undefined,
        'upnp:genre': item.genres,
        'upnp:author': item.writers,
        'upnp:director': item.director,
        'upnp:longDescription': item.plot,
        'xbmc:dateadded': upnp.formatDate(item.creationTime),
        'xbmc:rating': item.tmdbRating,
        'xbmc:votes': item.tmdbVoteCount,
        'xbmc:uniqueIdentifier': item.imdbId,
        'upnp:lastPlaybackTime': '',
        'upnp:playbackCount': (item.playState && item.playState.status === 'watched' ? 1 : 0),
        'upnp:lastPlaybackPosition': (item.playState && item.playState.time),
        'pith:itemId': item.id,
        'pith:channelId': channel.id,
        'xbmc:artwork': [
            item.backdrop ? {_attribs: {type: 'fanart'}, _value: cache(item.backdrop)} : undefined,
            item.poster ? {_attribs: {type: 'poster'}, _value: cache(item.poster)} : undefined,
            item.banner ? {_attribs: {type: 'banner'}, _value: cache(item.banner)} : undefined
        ],
        'upnp:albumArtURI': coverArt && [
            {
                _attribs: {'dlna:profileID': 'JPEG_TN'},
                _value: cacheAndResize(coverArt, 160, 160, 'jpg')
            }, {
                _attribs: {'dlna:profileID': 'JPEG_SM'},
                _value: cacheAndResize(coverArt, 640, 480, 'jpg')
            }, {
                _attribs: {'dlna:profileID': 'JPEG_MED'},
                _value: cacheAndResize(coverArt, 1024, 768, 'jpg')
            }
        ]
    };

    switch (item.mediatype) {
        case 'episode':
            return {
                ...didl,
                // "dc:publisher": "",
                'dc:title': `S${item.season}E${item.episode} : ${item.title}`,
                'upnp:programTitle': `S${item.season}E${item.episode} : ${item.title}`,
                'upnp:seriesTitle': item.showname,
                'upnp:episodeNumber': sprintf('%02d%02d', item.season, item.episode),
                'upnp:episodeSeason': 0
            };
        case 'season':
            return {
                ...didl,
                // "dc:publisher": "",
                'upnp:seriesTitle': item.showname,
                'upnp:episodeNumber': item.noEpisodes,
                'upnp:episodeSeason': 0
            };
        case 'show':
            return {
                ...didl,
                // "dc:publisher": "",
                'upnp:episodeNumber': item.noEpisodes
            };
        default:
            return didl;
    }
}
