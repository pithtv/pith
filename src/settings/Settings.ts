export interface Settings {
    dbEngine: "mongodb"|"nestdb"
    mongoUrl: string

    httpPort: number
    bindAddress: string

    pithContext: string
    apiContext: string

    files: {
        rootDir: string
        showHiddenFiles: boolean
        excludeExtensions: string[]
    }

    library: {
        scanInterval: number
        folders:
            {
                channelId: string
                containerId: string
                contains: 'movies' | 'tvshows' | 'music'
                scanAutomatically: true
            }[]
    }

    players: {

    }[]

    maxAgeForNew: number

    server: string

    sonarr: {
        enabled: boolean
        url: string
        apikey: string
    }

    radarr: {
        enabled: boolean
        url: string
        apikey: string
    }

    couchpotato: {
        enabled: boolean
        url: string
        apikey: string
    }

    upnpsharing: {
        enabled: boolean
    }

    uuid: {[key: string]: string}
}
