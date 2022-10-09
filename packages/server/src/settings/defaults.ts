import {Settings} from './Settings';

const defaults : Settings = {
  dbEngine: "nestdb",
  mongoUrl: "mongodb://localhost:27017/pith",
  httpPort: 3333,
  bindAddress: null,

  pithContext: "/pith",
  apiContext: "/rest",

  files: {
    rootDir: process.env.HOME || process.env.HOMEDIR || process.env.USERPROFILE,
    showHiddenFiles: false,
    excludeExtensions: [".nfo", ".tbn", ".sfv", ".nzb"],
  },

  library: {
    scanInterval: 1800000,
    folders: [
      {
        channelId: "files",
        containerId: "Movies",
        contains: "movies",
        scanAutomatically: true,
      },

      {
        channelId: "files",
        containerId: "Series",
        contains: "tvshows",
        scanAutomatically: true,
      },
    ],
  },

  maxAgeForNew: 7,

  players: [],
  server: "Pith",

  sonarr: {
    enabled: false,
    url: "http://localhost:8989/",
    apikey: "",
    pathMapping: []
  },

  couchpotato: {
    enabled: false,
    url: "http://localhost:5050/couchpotato/",
    apikey: "",
  },

  upnpsharing: {
    enabled: true,
  },

  uuid: {}
};

export default defaults;
