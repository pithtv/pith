import * as upnp from './upnp';
import {Global} from './global';
import * as entities from 'entities';
import {getLogger} from 'log4js';
import {sprintf} from 'sprintf-js';
import {didl} from './didl';
import {XmlObject} from './util';
import {IChannel} from '../channel';
import {container} from 'tsyringe';
import {
    IChannelItem,
    IContainerChannelItem, Image,
    IMediaChannelItem, ITvShow,
    ITvShowEpisode,
    ITvShowSeason
} from "@pithmediaserver/api";

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
        throw new Error(`Item type ${item.type} missing or not implemented`);
    }
}

function cacheAndResize(sourceUrl, width, height, format) {
    return `${global.rootUrl}/scale/${encodeURIComponent(sourceUrl)}?size=${width}x${height}&format=${format}`;
}

function cache(sourceUrl: string) : string {
    return `${global.rootUrl}/scale/${encodeURIComponent(sourceUrl)}?size=original`;
}

export function convertToDidl(channel, item: IChannelItem, parentId, channelId): didl.Item {
    function imagesToResources(images: Image[], protocolInfo: string) {
        return images ? images.map(poster => ({
            uri: entities.encodeXML(cache(poster.url)),
            protocolInfo
        })) : [];
    }

    return ({
        id: `channel:${channel.id}:${item.id}`,
        parentId: item.parentId ? `channel:${channel.id}:${item.parentId}` : parentId,
        updateId: 0,
        type: item.type === 'container' ? 'container' : 'item',
        properties: toDidlProperties(item, channel),
        resources: [
            ...(item.playable ? [{
                uri: `${global.rootUrl}/rest/channel/${channelId}/redirect/${encodeURIComponent(item.id)}`,
                protocolInfo: `http-get:*:${item.mimetype}:DLNA.ORG_OP=01;DLNA.ORG_CI=0`,
                size: item.fileSize
            }] : []),
            ...(imagesToResources(item.posters, 'xbmc.org:*:poster:*')),
            ...(imagesToResources(item.backdrops, 'xbmc.org:*:fanart:*')),
            ...(item.subtitles ? item.subtitles.map(subtitle => ({
                uri: subtitle.uri,
                protocolInfo: `http-get:*:${subtitle.mimetype}:*`
            })) : []),
            ...(item.subtitles ? item.subtitles.map(subtitle => ({
                uri: subtitle.uri,
                protocolInfo: `http-get:*:smi/caption:*`
            })) : [])
        ]
    });
}

function toDidlProperties(item : IChannelItem, channel : IChannel) : XmlObject {
    const coverArt = item.posters?.[0];

    function unwrap(images: Image[], type: string) {
        return images ? images.map(backdrop => ({
            _attribs: {type},
            _value: cache(backdrop.url)
        })) : [];
    }

    const didlProperties = {
        'dc:title': item.title,
        'upnp:class': upnpClassFromItem(item),
        'dc:date': upnp.formatDate(item.releaseDate) || undefined,
        'upnp:genre': item.genres,
        'upnp:author': item.writers,
        'upnp:director': item.director,
        'upnp:longDescription': item.plot,
        'xbmc:dateadded': item.creationTime && upnp.formatDate(item.creationTime),
        'xbmc:rating': item.tmdbRating,
        'xbmc:votes': item.tmdbVoteCount,
        'xbmc:uniqueIdentifier': item.imdbId,
        'upnp:lastPlaybackTime': '',
        'upnp:playbackCount': (item.playState && item.playState.status === 'watched' ? 1 : 0),
        'upnp:lastPlaybackPosition': (item.playState && item.playState.time),
        'pith:itemId': item.id,
        'pith:channelId': channel.id,
        'xbmc:artwork': [
            ...unwrap(item.backdrops, 'fanart'),
            ...unwrap(item.posters, 'poster'),
            ...unwrap(item.banners, 'banner')
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
            const episode = item as ITvShowEpisode;
            return {
                ...didlProperties,
                // "dc:publisher": "",
                'dc:title': `S${episode.season}E${episode.episode} : ${episode.title}`,
                'upnp:programTitle': `S${episode.season}E${episode.episode} : ${episode.title}`,
                'upnp:seriesTitle': episode.showname,
                'upnp:episodeNumber': sprintf('%02d%02d', episode.season, episode.episode),
                'upnp:episodeSeason': 0
            };
        case 'season':
            const season = item as ITvShowSeason;
            return {
                ...didlProperties,
                // "dc:publisher": "",
                'upnp:seriesTitle': season.showname,
                'upnp:episodeNumber': season.noEpisodes,
                'upnp:episodeSeason': 0
            };
        case 'show':
            const show = item as ITvShow;
            return {
                ...didlProperties,
                // "dc:publisher": "",
                'upnp:episodeNumber': show.noEpisodes
            };
        default:
            return didlProperties;
    }
}
