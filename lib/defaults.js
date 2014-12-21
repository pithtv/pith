module.exports = {
  "dbEngine": "mongodb",
  "mongoUrl": "mongodb://localhost:27017/pith",
  "tingoPath": "db",
  "httpPort": 3333,
  "bindAddress": null,

  "pithContext": "/pith",
  "webUiContext": "/webui",
  "apiContext": "/rest",

  "files": {
    "rootDir": process.env.HOME,
    "showHiddenFiles": false,
    "excludeExtensions": [".nfo", ".tbn", ".sfv", ".nzb"]
  },

  "library": {
    "scanInterval": 1800000,
    "folders": [
      {
        "channelId": "files",
        "containerId": "Movies",
        "contains": "movies",
        "scanAutomatically": true
      },

      {
        "channelId": "files",
        "containerId": "Series",
        "contains": "tvshows",
        "scanAutomatically": true
      }
    ]
  },

  "players": []
};