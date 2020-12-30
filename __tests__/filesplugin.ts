import 'reflect-metadata';
import mock from 'mock-fs';
import {FilesChannel} from '../src/plugins/files/plugin';
import {Pith} from '../src/pith';
import {StateStore} from '../src/plugins/files/playstate';
import {SettingsStore} from '../src/settings/SettingsStore';

test('Movie file metadata', async () => {
    mock({
        '/data/movies/': {
            'Angels In Antwerp (2020)': {
                'moviefile.mkv': 'notempty',
                'moviefile.en.srt': 'notempty'
            },
            'The Beckoning (1971)': {
                'VIDEO_TS': {
                    'VTS_03_01.VOB': 'notempty'
                }
            }
        }
    });

    const channel = new FilesChannel({
        rootUrl: "http://localhost:3333/"
    } as Pith, {} as StateStore, {
        settings: {
            files: {
                rootDir: '/data',
                showHiddenFiles: true,
                excludeExtensions: []
            }
        }
    } as SettingsStore);

    const rootContents = await channel.listContents();

    expect(rootContents).toEqual([{
        id: 'movies',
        title: 'movies',
        type: 'container',
        preferredView: 'details'
    }]);

    const movieContents = await channel.listContents('movies');

    expect(movieContents).toEqual([{
        id: 'movies/Angels In Antwerp (2020)',
        title: 'Angels In Antwerp (2020)',
        type: 'container',
        preferredView: 'details'
    }, {
        id: 'movies/The Beckoning (1971)',
        title: 'The Beckoning (1971)',
        type: 'container',
        preferredView: 'details'
    }]);

    const movieOneContents = await channel.listContents('movies/Angels In Antwerp (2020)');

    expect(movieOneContents).toMatchObject([{
        id: 'movies/Angels In Antwerp (2020)/moviefile.en.srt',
        mimetype: 'text/srt',
        playable: false,
        type: 'file'
    }, {
        id: 'movies/Angels In Antwerp (2020)/moviefile.mkv',
        title: 'Angels In Antwerp',
        year: 2020,
        type: 'file',
        mediatype: 'movie',
        mimetype: 'video/x-matroska'
    }]);

    const movieOneItem = await channel.getItem('movies/Angels In Antwerp (2020)/moviefile.mkv');

    expect(movieOneItem).toMatchObject({
        id: 'movies/Angels In Antwerp (2020)/moviefile.mkv',
        title: 'Angels In Antwerp',
        year: 2020,
        type: 'file',
        mediatype: 'movie',
        mimetype: 'video/x-matroska',
        subtitles: [
            {
                language: 'en',
                uri: 'http://localhost:3333/stream/0/movies/Angels%20In%20Antwerp%20(2020)/moviefile.en.srt',
                mimetype: 'text/srt'
            }
        ]
    });

    const movieTwoContents = await channel.listContents('movies/The Beckoning (1971)/VIDEO_TS');

    expect(movieTwoContents).toMatchObject([{
        id: 'movies/The Beckoning (1971)/VIDEO_TS/VTS_03_01.VOB',
        title: 'The Beckoning',
        year: 1971,
        type: 'file',
        mediatype: 'movie',
        mimetype: 'video/dvd'
    }]);

    const movieTwoItem = await channel.getItem('movies/The Beckoning (1971)/VIDEO_TS/VTS_03_01.VOB');
    expect(movieTwoItem).toMatchObject({
        id: 'movies/The Beckoning (1971)/VIDEO_TS/VTS_03_01.VOB',
        title: 'The Beckoning',
        year: 1971,
        type: 'file',
        mediatype: 'movie',
        mimetype: 'video/dvd'
    });

    mock.restore();
});

test("nfo metadata provider", async () => {
    mock({
        '/data/movies': {
            'Titled (2020)': {
                'Titled.nfo': '<?xml version="1.0" ?><movie><title>Titled</title><year>2020</year></movie>',
                'Titled.mkv': 'notempty'
            },
            'Imdbeed (1999)': {
                'Imdbeed.nfo': 'Imdbeed\nImdb : tt9999999\n\nThanks!',
                'Imdbeed.mkv': 'notempty'
            },
            'Scrambled (1988)': {
                'movie.nfo': 'Nothing in here of any value',
                'scrambled.mkv': 'notempty'
            }
        }
    });

    const channel = new FilesChannel({} as Pith, {} as StateStore, {
        settings: {
            files: {
                rootDir: '/data',
                showHiddenFiles: true,
                excludeExtensions: []
            }
        }
    } as SettingsStore);

    expect(await channel.getItem('movies/Imdbeed (1999)/Imdbeed.mkv')).toMatchObject({
        title: 'Imdbeed',
        imdbId: 'tt9999999'
    });

    expect(await channel.getItem('movies/Titled (2020)/Titled.mkv')).toMatchObject({
        title: 'Titled',
        year: 2020
    });

    expect(await channel.getItem('movies/Scrambled (1988)/scrambled.mkv')).toMatchObject({
        title: 'Scrambled',
        year: 1988
    });

    mock.restore();
});
