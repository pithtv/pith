pith
====

The Pith media hub at the center of your entertainment network.

The aim of this project is to create a media server for videos and music that can be controlled through a web browser and will stream the media to a variety of renderers such as UPnP MediaRenderers (most TV's and blu-ray players), AirPlay devices, or just through the web browser.

The concept is centered around searchable channels that provide a hierarchy. First channels to be implemented (in order):

- Files channel: just straight filesystem browsing
- Movies channel: certain directories are scanned for movies which will then be indexed and browsable by title, year, runtime, etc
- TV Shows channel: same as movies but with more appropriate metadata
- Music channel: a directory is scanned for music and metadata is retrieved from ID3 or similar tags
- Spotify channel: use libspotify to add support for Premium members to stream Spotify music to their playback device of choice

Immediate goals:

- lightweight so it can easily run on NAS devices
- web ui that feels like you're working on a native app
- web ui usable on desktop, laptop, tablet, smartphone and smart tv
- index locally stored media into comprehensive libraries with extensive meta-data support
- allow streaming media as well (e.g. Spotify)
- transcoding/remuxing support
- UPnP MediaRenderer playback with codec support profiles
- extensible through plugins (adding channels, views, ...)
- extensive JSON/REST api (the web ui should use this exclusively so that all functionality supported by the web ui can eventually be incorporated into a native app).

Long term goals:

- AirPlay support
- UPnP MediaServer support

It's built on a MEAN stack (so MongoDB, Express, Angular and NodeJS), with some help from Bootstrap to make it all pretty.

Getting started
===============
Install node

    sudo apt-get install nodejs

Clone the project:

    git clone http://github.com/Evinyatar/pith.git pith
    cd pith

Install node and bower dependencies

    npm install
    npm run-script build

Start it up

    npm start

Navigate to the URL that is mentioned in the logging, and click the menu to go into settings to set up your media path and library. Restart pith after saving those settings.
